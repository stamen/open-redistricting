// import node modules
import React from 'react';
import { withRouter } from 'react-router';
import { debounce } from 'lodash';

import auth from '../models/auth';
import Header from '../components/Header.jsx';

// config
// import sassVars from '../../scss/variables.json';
// import appConfig from '../../static/config/appConfig.json';


// main app container
class App extends React.Component {

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

		let code = auth.extractOAuthCode();
		if (code) {
			let state = auth.extractOAuthState();
			// If we have an OAuth code in the query param,
			// redirect to the /auth route to fetch an access token.
			// Pass the state too, if it's present.
			
			// Note that we must remove the query string before continuing with hash-based routing
			// to avoid polluting the URL with both a before- and after-hash query string.
			window.history.replaceState(null, '', this.props.location.pathname);

			this.props.history.replace({
				pathname: '/auth',
				query: {
					code,
					state
				}
			})
		}

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
				<Header { ...this.props } />
				{ this.props.children }
			</div>
		);

	}

}

export default withRouter(App);
