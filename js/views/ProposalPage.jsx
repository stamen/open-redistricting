// import node modules
import React from 'react';
import { Link, withRouter } from 'react-router';
import get from 'lodash.get';
import moment from 'moment';

import { deriveProjectId } from '../models/reducers';

class ProposalPage extends React.Component {

	constructor (props) {

		super(props);

	}

	componentWillMount () {

		const storeState = this.props.store.getState(),
			project = storeState.projects[deriveProjectId(this.props.params.owner, this.props.params.projectId)],
			projectInfo = get(project, 'data'),
			proposal = get(project, `proposals.data[${ this.props.params.proposalId }]`);

		if (!projectInfo || !Object.keys(projectInfo).length) {
			// only fetch containing project if it's not already in the store
			this.props.actions.requestProjectMetadata(this.props.params.owner, this.props.params.projectId);
		}

		if (!proposal) {
			// only fetch proposal if it's not already in the store.
			this.props.actions.requestProposal(this.props.params.owner, this.props.params.projectId, this.props.params.proposalId);
		}

	}

	componentDidMount () {

		//

	}

	componentWillUnmount () {

		//

	}

	render () {

		const storeState = this.props.store.getState(),
			project = storeState.projects[deriveProjectId(this.props.params.owner, this.props.params.projectId)],
			projectInfo = get(project, 'data'),
			proposal = get(project, `proposals.data[${ this.props.params.proposalId }]`);

		console.log(">>>>> project:", projectInfo);
		console.log(">>>>> proposal:", proposal);

		return (
			<div className='page proposal-page'>
				<div className='main'>
					<div className='map'>
					</div>
					<div className='info'>
						<h2 className='title'>{ proposal.title }</h2>
						<Link to='#'>{ get(projectInfo, 'name') || '' }</Link>
						<p className='body'>{ proposal.body }</p>
						<div className='created-date'>{ moment(proposal.created_at).format('MMM D YYYY') }</div>
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

}

export default withRouter(ProposalPage);
