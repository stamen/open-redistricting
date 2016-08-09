// import node modules
import { Component } from 'react';
import { withRouter } from 'react-router';

// views
// import Header from '../views/Header.jsx';

// import sassVars from '../../scss/variables.json';


class Proposal extends Component {

	constructor (props) {

		super(props);

	}

	componentWillMount () {

		console.log(">>>>> TODO: requestProposal("+ this.props.params.proposalId +")");
		// this.props.actions.requestProposal(this.props.params.proposalId);

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
			<div className='project'>
			</div>
		);

	}

}

export default withRouter(Project);
