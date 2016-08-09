// import node modules
import React from 'react';
import { withRouter } from 'react-router';

// import sassVars from '../../scss/variables.json';


class ProjectPage extends React.Component {

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
			<div className='project-page'>
			</div>
		);

	}

}

export default withRouter(ProjectPage);
