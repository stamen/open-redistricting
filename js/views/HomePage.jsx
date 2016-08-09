// import node modules
import React from 'react';
import { withRouter } from 'react-router';

// import sassVars from '../../scss/variables.json';


class HomePage extends React.Component {

	constructor (props) {

		super(props);

	}

	componentWillMount () {

		console.log(">>>>> TODO: requestProjectList()");
		// this.props.actions.requestProjectList();

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
			<div className='home-page'>
			</div>
		);

	}

}

export default withRouter(HomePage);
