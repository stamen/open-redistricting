// import node modules
import { Component } from 'react';
import { withRouter } from 'react-router';

// views
// import Header from '../views/Header.jsx';

// import sassVars from '../../scss/variables.json';


class Project extends Component {

	constructor (props) {

		super(props);

	}

	componentWillMount () {

		console.log(">>>>> TODO: requestProject("+ this.props.params.projectId +")");
		// this.props.actions.requestProject(this.props.params.projectId);

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
