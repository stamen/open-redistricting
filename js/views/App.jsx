import { debounce } from 'lodash';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import AppContext from '../context';
import auth from '../models/auth';
import Header from '../components/Header.jsx';

import Auth from './Auth.jsx';
import HomePage from './HomePage.jsx';
import ProjectPage from './ProjectPage.jsx';
import ProposalPage from './ProposalPage.jsx';
import RouteNotFound from './404.jsx';

// main app container
class App extends React.Component {
	static contextType = AppContext;

    constructor (props) {
        super(props);

        this.state = {
        	hasError: null
        };

        // Redux store unsubscribe fn
        this.unsubscribe = null;

        // bind event handlers
        this.onWindowResize = debounce(this.onWindowResize.bind(this), 250);

        this.checkForInboundAuth();
    }

    onAppStateChange = () => {

		this.forceUpdate();

	};


    // ============================================================ //
    // React Lifecycle
    // ============================================================ //

    componentDidMount () {

        this.unsubscribe = this.context.store.subscribe(this.onAppStateChange);
    	
	}

    componentWillUnmount () {

    	this.unsubscribe && this.unsubscribe();

		window.removeEventListener('resize', this.onWindowResize);

	}

	static getDerivedStateFromError = (error) => ({ hasError: error })


    // ============================================================ //
    // Handlers
    // ============================================================ //

    onWindowResize (event) {

    	// TODO: what is this??
		// this.computeComponentDimensions();

	}



    // ============================================================ //
    // Helpers
    // ============================================================ //

    checkForInboundAuth () {

		let code = auth.extractOAuthCode();
		if (code) {
			let state = auth.extractOAuthState();
			// If we have an OAuth code in the query param,
			// redirect to the /auth route to fetch an access token.
			// Pass the state too, if it's present.
			
			// Note that we must remove the query string before continuing with hash-based routing
			// to avoid polluting the URL with both a before- and after-hash query string.
			window.history.replaceState(null, '', window.location.pathname);

			//
			// TODO NEXT:
			// what changed in my greenkeeping that now makes this.props.history
			// undefined instead of a history object, with navigation?
			// https://github.com/ReactTraining/history/blob/master/README.md#navigation
			//
			// only thing i can guess is redux 3.6 -> 4.0.
			// https://github.com/stamen/open-redistricting/compare/c307d1c99b2b2e6c471a6d0b85fb8a3e1843ca2f...master
			//
			// could maybe switch to using `routerMiddleware` to work around?
			// https://www.npmjs.com/package/react-router-redux#pushlocation--replacelocation--gonumber--goback--goforward
			//
			// try checking out older commit, and inspecting with React devtools
			// to see if/when history is available on props.
			//
			this.props.history.replace({
				pathname: '/auth',
				query: {
					code,
					state
				}
			})
		}

	}



    // ============================================================ //
    // Render functions
    // ============================================================ //

    render () {

		return (
			<div className='app-container'>
				{ this.state.hasError
					?	<div className='error-display'>{this.state.hasError.message}</div>
					:	(<>
							<Header { ...this.props } />
							<Switch>
								<Route path={ '/' } exact component={ HomePage } />
								<Route path={ '/:owner/:projectId/:proposalId' } component={ ProposalPage } />
								<Route path={ '/:owner/:projectId' } component={ ProjectPage } />
								<Route path={ '/auth' } component={ Auth } />
								<Route component={ RouteNotFound } />
							</Switch>
						</>)
				}
			</div>
		);

	}
}

export default App;
