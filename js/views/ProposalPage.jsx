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
import DiffMap from '../components/DiffMap.jsx';

class ProposalPage extends React.Component {

	constructor (props) {

		super(props);

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

	render () {

		const {
				projectMetadata,
				proposal
			} = this.getStoreState(),
			proposalIsLoading = !proposal || proposal.loading;

		let body = sanitizeHtml((get(proposal, 'body') || '').replace(/\n/g, '<br>'));

		let diffPaths;
		if (!proposalIsLoading) {
			diffPaths = [
				`https://raw.githubusercontent.com/${ this.props.params.owner }/${ this.props.params.projectId }/${ proposal.base.sha }/${ mapFilename }`,
				`https://raw.githubusercontent.com/${ this.props.params.owner }/${ this.props.params.projectId }/${ proposal.head.sha }/${ mapFilename }`
			];
		}

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
						<Link to='#'>{ get(projectMetadata, 'name') || '' }</Link>
						<p className='body' dangerouslySetInnerHTML={{ __html: body }} />
						{ proposalIsLoading ? null : <div className='created-date'>{ moment(proposal.created_at).format('MMM D YYYY') }</div> }
						<div className='footer'>{/* consider making this a functional component, with social share icons, and thumbs up/down as its own component */}</div>
					</div>
					<div className='comments'>
						<h3>Comments</h3>
						<div className='comment-input'>
						</div>
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
