// import node modules
import { Component } from 'react';
import { withRouter } from 'react-router';
import { debounce } from 'lodash';

// views
// import Header from '../views/Header.jsx';

// config
// import sassVars from '../../scss/variables.json';
// import appConfig from '../../static/config/appConfig.json';


// main app container
class App extends Component {

	constructor (props) {

		super(props);

		// bind event handlers
		this.onWindowResize = debounce(this.onWindowResize.bind(this), 250);
		this.onAppStateChange = this.onAppStateChange.bind(this);

		// subscribe for future state changes
		props.store.subscribe(this.onAppStateChange);

	}

	onAppStateChange () {

		this.forceUpdate();

	}


	// ============================================================ //
	// React Lifecycle
	// ============================================================ //

	componentWillMount () {

		// this.props.actions.requestProjects();

	}

	componentDidMount () {

		//

	}

	componentWillUnmount () {

		window.removeEventListener('resize', this.onWindowResize);

	}



	// ============================================================ //
	// Handlers
	// ============================================================ //

	onWindowResize (event) {

		this.computeComponentDimensions();

	}



	// ============================================================ //
	// Helpers
	// ============================================================ //

	//



	// ============================================================ //
	// Render functions
	// ============================================================ //

	render () {

		const storeState = this.props.store.getState();

		return (
			<div className='app-container'>
				{/* <Header { ...this.props } /> */}
				{ this.props.children }
			</div>
		);

	}

}

export default withRouter(App);
