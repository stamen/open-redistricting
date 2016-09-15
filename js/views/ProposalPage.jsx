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

class ProposalPage extends React.Component {

	constructor (props) {

		super(props);
		this.login = this.login.bind(this);
		this.onCommentVote = this.onCommentVote.bind(this);
		this.submitComment = this.submitComment.bind(this);

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

	}

	componentWillReceiveProps (nextProps) {

		const { proposal } = this.getStoreState();
		let comments = get(proposal, 'comments') || [],
			revisions = get(proposal, 'revisions') || [];

		if (typeof this.previousNumComments !== 'undefined' && this.previousNumComments !== comments.length) {
			// new store state coming in with just-created comment,
			// so reenable the comment UI by removing this flag
			delete this.previousNumComments;

			// clear out comment textarea
			this.refs.commentInput.value = '';

		}

		// TODO: same thing for revision creation

	}

	login () {

		auth.authorize(this.props.location.pathname);

	}

	onCommentVote (commentId, val) {

		const { proposal } = this.getStoreState();
		let comments = get(proposal, 'comments') || [],
			comment = comments.find(c => c.id === commentId);

		if (!comment) return;

		console.log(`>>>>> TODO: vote ${ val } on: ${ comment }`);
		
		// TODO: refactor authedUserIsMember to just get user info,
		// 		 then check if comment author is viewer and if so bail
		// 		 (or maybe just let API decide? -- nope, you can thumbs up/down your own content)
		// 		 in fact, check should be done in render / <Comment> so we can't even get here

	}

	submitComment () {

		// bail if already in the process of submitting a comment
		if (typeof this.previousNumComments !== 'undefined') return;

		const { proposal } = this.getStoreState();
		let comments = get(proposal, 'comments') || [];

		this.previousNumComments = comments.length;
		this.props.actions.createProposalComment(this.refs.commentInput.value, this.props.params.projectId, this.props.params.proposalId);

	}

	render () {

		const {
				projectMetadata,
				proposal
			} = this.getStoreState(),
			proposalIsLoading = !proposal || proposal.loading,
			isLoggedIn = auth.loggedIn();

		let body = sanitizeHtml((get(proposal, 'body') || '').replace(/\n/g, '<br>'));

		let diffPaths;
		if (!proposalIsLoading) {
			diffPaths = [
				`https://raw.githubusercontent.com/${ this.props.params.owner }/${ this.props.params.projectId }/${ proposal.base.sha }/${ mapFilename }`,
				`https://raw.githubusercontent.com/${ this.props.params.owner }/${ this.props.params.projectId }/${ proposal.head.sha }/${ mapFilename }`
			];
		}

		let revisions = get(proposal, 'commits') || [],
			comments = get(proposal, 'comments') || [],
			commentIsBeingSubmitted = typeof this.previousNumComments !== 'undefined',
			revisionIsBeingSubmitted = typeof this.previousNumRevisions !== 'undefined';

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
						<div className='footer'>{/* consider making this a functional component, with social share icons, and thumbs up/down as its own component */}</div>
					</div>
					<div className='comments'>
						<h3>Comments</h3>
						{ isLoggedIn ?
							<div className='comment-input'>
								<textarea ref='commentInput' placeholder='Add comment' />
								<div className={ `comment-button${ commentIsBeingSubmitted ? ' disabled' : '' }` } onClick={ () => this.submitComment() }>Comment</div>
							</div> :
							<div className='signin-cta' onClick={ this.login }>Sign in to add a comment.</div>
						}
						<ul>
							{ comments.map(comment => {
								return <li key={ comment.id }>
									<Comment
										id={ comment.id.toString() }
										body= { comment.body }
										authorName= { comment.user.login }
										date= { moment(comment.updated_at).format('MMM D YYYY h:mma') }
										upvotes= { get(comment, 'reactions["+1"]') || 0 }
										downvotes= { get(comment, 'reactions["-1"]') || 0 }
										canVote={ isLoggedIn }
										onVote={ this.onCommentVote }
									/>
								</li>;
							}) }
						</ul>
					</div>
				</div>
				<div className='sidebar'>
				</div>
			</div>
		);

	}

	getStoreState () {

		const storeState = this.props.store.getState(),
			project = storeState.projects[deriveProjectId(this.props.params.owner, this.props.params.projectId)],
			projectMetadata = get(project, 'metadata'),
			proposal = storeState.proposals[deriveProposalId(this.props.params.owner, this.props.params.projectId, this.props.params.proposalId)];

		return {
			project,
			projectMetadata,
			proposal
		};

	}

}

export default withRouter(ProposalPage);
