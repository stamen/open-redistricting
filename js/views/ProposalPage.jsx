// import node modules
import React from 'react';
import { withRouter } from 'react-router';

// import sassVars from '../../scss/variables.json';

class ProposalPage extends React.Component {

	constructor (props) {

		super(props);

	}

	componentWillMount () {

		console.log(">>>>> TODO: requestProposal("+ this.props.params.proposalId +")");
		// this.props.actions.requestProject(this.props.params.owner, this.props.params.projectId, this.props.params.proposalId);

	}

	componentDidMount () {

		//

	}

	componentWillUnmount () {

		//

	}

	render () {

		const storeState = this.props.store.getState();

		return (
			<div className='proposal-page'>
				TODO: Proposal page for proposal #{ this.props.params.proposalId }
			</div>
		);

	}

}

export default withRouter(ProposalPage);
