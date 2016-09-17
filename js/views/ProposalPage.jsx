// import node modules
import React from 'react';
import { Link, withRouter } from 'react-router';
import get from 'lodash.get';
import moment from 'moment';
import sanitizeHtml from 'sanitize-html';

import { mapFilename } from '../../static/appConfig.json';
import {
	deriveProjectId,
	deriveProposalId
} from '../models/reducers';
import auth from '../models/auth';
import DiffMap from '../components/DiffMap.jsx';
import Comment from '../components/Comment.jsx';
import Revision from '../components/Revision.jsx';
import AddItemModal from '../components/AddItemModal.jsx';

const PROPOSAL_VOTE_KEY = 'proposal';

class ProposalPage extends React.Component {

	constructor (props) {

		super(props);
		this.login = this.login.bind(this);
		this.onViewRevision = this.onViewRevision.bind(this);
		this.openRevisionModal = this.openRevisionModal.bind(this);
		this.onRevisionModalClose = this.onRevisionModalClose.bind(this);
		this.onCommentVote = this.onCommentVote.bind(this);
		this.submitComment = this.submitComment.bind(this);

		this.state = {};

	}

	componentWillMount () {

		const {
			proposal,
			project
		} = this.getStoreState();

		if (!project || !Object.keys(project).length) {
			// only fetch containing project if it's not already in the store
			this.props.actions.requestProject(this.props.params.projectId);
		}

		if (!proposal) {
			// only fetch proposal if it's not already in the store.
			this.props.actions.requestProposal(this.props.params.projectId, this.props.params.proposalId);
		}

		let { viewer } = this.props.store.getState();
		if (typeof(viewer.isMember === 'undefined') && !viewer.loading) {
			// get viewer info if not already available
			this.props.actions.getViewer();
		}

	}

	componentWillReceiveProps (nextProps) {

		const { proposal } = this.getStoreState();
		let comments = get(proposal, 'comments') || [],
			revisions = get(proposal, 'commits') || [];

		if (typeof this.previousNumComments !== 'undefined' && this.previousNumComments !== comments.length) {
			// new store state coming in with just-created comment,
			// so reenable the comment UI by removing this flag
			delete this.previousNumComments;

			// clear out comment textarea
			this.refs.commentInput.value = '';

		}

		if (this.commentVotePending && ++this.commentVotePending.tickCount >= 2) {
			// TODO: this works only because we rely on this function being called
			// once for CREATE_PROPOSAL_REACTION_REQUESTED, and again for CREATE_PROPOSAL_REACTION_RESPONDED.
			// Design a more robust solution that looks for specific changes in the store.

			// comment vote request has returned successfully
			delete this.commentVotePending;
		}

		if (typeof this.previousNumRevisions !== 'undefined' && this.previousNumRevisions !== revisions.length) {
			// new store state coming in with just-created revision,
			// so close the modal
			delete this.previousNumRevisions;
			this.setState({ modalIsOpen: false });
		}

	}

	onViewRevision (sha) {

		this.setState({ currentRevisionSha: sha });

	}

	openRevisionModal () {

		this.setState({ modalIsOpen: true });

	}

	onRevisionModalClose (values) {

		if (!values) {
			this.setState({ modalIsOpen: false });
		} else {

			const { proposal } = this.getStoreState();
			this.previousNumRevisions = proposal.commits.length;

			let reader = new FileReader();
			reader.addEventListener('load', event => {
				let fileBase64 = reader.result.split(',')[1];
				this.props.actions.createProposalRevision(
					values.desc,
					fileBase64,
					this.props.params.projectId,
					this.props.params.proposalId,
					proposal
				);
			});
			reader.readAsDataURL(values.file);

		}

	}

	login () {

		auth.authorize(this.props.location.pathname);

	}

	submitComment () {

		// bail if already in the process of submitting a comment
		if (typeof this.previousNumComments !== 'undefined') return;

		const { proposal } = this.getStoreState();
		let comments = get(proposal, 'comments') || [];

		this.previousNumComments = comments.length;
		this.props.actions.createProposalComment(this.refs.commentInput.value, this.props.params.projectId, this.props.params.proposalId);

	}

	onCommentVote (commentId, val) {

		// one vote at a time.
		if (this.commentVotePending) return;

		const {
			proposal,
			viewer
		} = this.getStoreState();
		let comments = get(proposal, 'comments') || [],
			comment = comments.find(c => c.id === commentId),
			viewerId = get(viewer, 'login');

		// author cannot vote on own proposals nor own comments.
		// already enforced in render(); this is just a safety check.
		if (viewerId === get(proposal, 'user.login')) return;
		if (viewerId === get(comment, 'user.login')) return;

		this.commentVotePending = {
			commentId,
			reaction: val,
			tickCount: 0
		};

		this.props.actions.createProposalReaction(
			val,
			this.props.params.projectId,
			this.props.params.proposalId,
			viewerId,
			commentId === PROPOSAL_VOTE_KEY ? null : commentId
		);

	}

	render () {

		const {
				projectMetadata,
				proposal,
				viewer
			} = this.getStoreState(),
			proposalIsLoading = !proposal || !proposal.base,
			isSignedIn = get(viewer, 'isSignedIn');

		let body = sanitizeHtml((get(proposal, 'body') || '').replace(/\n/g, '<br>'));

		let diffPaths;
		if (!proposalIsLoading) {
			let currentRevisionSha = this.state.currentRevisionSha || proposal.head.sha;
			diffPaths = [
				`https://raw.githubusercontent.com/${ this.props.params.owner }/${ this.props.params.projectId }/${ proposal.base.sha }/${ mapFilename }`,
				`https://raw.githubusercontent.com/${ this.props.params.owner }/${ this.props.params.projectId }/${ currentRevisionSha }/${ mapFilename }`
			];
		}

		let revisions = get(proposal, 'commits') || [],
			comments = get(proposal, 'comments') || [],
			reactions = get(proposal, 'reactions') || [],
			commentIsBeingSubmitted = typeof this.previousNumComments !== 'undefined',
			revisionIsBeingSubmitted = typeof this.previousNumRevisions !== 'undefined',
			viewerIsProposalAuthor = get(proposal, 'user.login') && get(proposal, 'user.login') === get(viewer, 'login'),
			proposalVoteIsPending = this.commentVotePending && this.commentVotePending.commentId === PROPOSAL_VOTE_KEY,
			proposalUpvotes = reactions.filter(r => r.content === '+1').length,
			proposalDownvotes = reactions.filter(r => r.content === '-1').length;

		return (
			<div className='page proposal-page'>
				<div className='main'>
					{ diffPaths ?
						<DiffMap
							path1={ diffPaths[0] }
							path2={ diffPaths[1] }
							fetchJSON={ this.props.actions.fetchJSON }
						/>
						: null
					}
					<div className='info'>
						<h2 className='title'>{ proposalIsLoading ? '' : proposal.title }</h2>
						<Link to={ `/${ this.props.params.owner }/${ this.props.params.projectId }` }>{ get(projectMetadata, 'name') || '' }</Link>
						<p className='body' dangerouslySetInnerHTML={{ __html: body }} />
						{ proposalIsLoading ? null : <div className='created-date'>{ moment(proposal.created_at).format('MMM D YYYY') }</div> }
						<div className='footer'>
							<div className={ `up votes${ (isSignedIn && !viewerIsProposalAuthor) ? ' enabled' : '' }` }>
								<i className='em em---1' onClick={ () => this.onCommentVote(PROPOSAL_VOTE_KEY, '+1') }></i>
									{ proposalVoteIsPending ? <i className='pending'></i> : proposalUpvotes || 0 }
							</div>
							<div className={ `down votes${ (isSignedIn && !viewerIsProposalAuthor) ? ' enabled' : '' }` }>
								<i className='em em--1' onClick={ () => this.onCommentVote(PROPOSAL_VOTE_KEY, '-1') }></i>
									{ proposalVoteIsPending ? <i className='pending'></i> : proposalDownvotes || 0 }
							</div>
							{ !isSignedIn ? <a className='signin-cta' onClick={ this.login }>Sign in to vote.</a> : null }
						</div>
					</div>
					<div className='comments'>
						<h3>Comments</h3>
						{ isSignedIn ?	
							<div className='comment-input'>
								<textarea ref='commentInput' placeholder='Add comment' />
								<div className={ `comment-button${ commentIsBeingSubmitted ? ' disabled' : '' }` } onClick={ () => this.submitComment() }>Comment</div>
							</div> :
							<a className='signin-cta' onClick={ this.login }>Sign in to add a comment.</a>
						}
						<ul>
							{ comments
								.filter(comment => !!comment.id)	// be defensive, only display valid comments
								.map(comment => {
									let viewerIsAuthor = get(viewer, 'login') === get(comment, 'user.login'),
										canVote = isSignedIn && !viewerIsAuthor,
										voteIsPending = get(this.commentVotePending, 'commentId') === comment.id;

									return <li key={ comment.id }>
										<Comment
											id={ comment.id }
											body= { comment.body }
											authorName= { comment.user.login }
											date= { moment(comment.updated_at).format('MMM D YYYY h:mma') }
											upvotes= { get(comment, 'reactions["+1"]') || 0 }
											downvotes= { get(comment, 'reactions["-1"]') || 0 }
											canVote={ canVote }
											onVote={ canVote ? this.onCommentVote : undefined }
											voteIsPending={ voteIsPending }
										/>
									</li>;
							}) }
						</ul>
					</div>
				</div>
				<div className='sidebar'>
					<div className='revisions-header'>
						<h3>Revisions</h3>
						{ viewerIsProposalAuthor ? <div className='add-revision' onClick={ this.openRevisionModal }>+ Add</div> : null }
					</div>
					<ul>
						{ revisions
							.slice(1)								// don't show the initial commit
							.filter(revision => !!revision.commit)	// be defensive, only display valid revisions
							.map(revision => {
								return <li key={ revision.sha || revision.commit.sha }>
									<Revision
										sha={ revision.sha || revision.commit.sha }
										desc={ revision.commit.message }
										date={ moment(revision.commit.author.date).format('MMM D YYYY') }
										onView={ this.onViewRevision }
									/>
								</li>;
							})
						}
					</ul>
				</div>
				<AddItemModal
					type='revision'
					desc={ `Create a new revision to this proposal.\u000AUpload a revision to the proposal's map file.` }
					isOpen={ this.state.modalIsOpen }
					onClose={ this.onRevisionModalClose }
					className='add-item-modal'
				/>
			</div>
		);

	}

	getStoreState () {

		const storeState = this.props.store.getState(),
			project = storeState.projects[deriveProjectId(this.props.params.owner, this.props.params.projectId)],
			projectMetadata = get(project, 'metadata'),
			proposal = storeState.proposals[deriveProposalId(this.props.params.owner, this.props.params.projectId, this.props.params.proposalId)],
			{ viewer } = storeState;

		return {
			project,
			projectMetadata,
			proposal,
			viewer
		};

	}

}

export default withRouter(ProposalPage);
