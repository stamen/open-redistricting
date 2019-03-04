// import node modules
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

// main app container
class App extends React.Component {
	static contextType = AppContext;

    constructor (props) {
        super(props);

        this.state = {
        	hasError: null
        };

        // bind event handlers
        this.onWindowResize = debounce(this.onWindowResize.bind(this), 250);

        // subscribe for future state changes
        // this.context.store.subscribe(this.onAppStateChange);

        this.checkForInboundAuth();
    }

    onAppStateChange = () => {

		this.forceUpdate();

	};


    // ============================================================ //
    // React Lifecycle
    // ============================================================ //

    componentDidMount () {

        // subscribe for future state changes
        // TODO: is this necessary now that we're using Context API?
        // Will a change in context.store trigger a component tree rerender?
        this.context.store.subscribe(this.onAppStateChange);
    	
	}

    componentWillUnmount () {

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
    	// TODO: remove this block once migration to new setup
    	// (react 16, react-router 4) is complete

		/*
		const storeState = this.context.store.getState();

		// Clone child to ensure it gets rendered,
		// even with identical props/state (since we're 
		// managing state in Redux store, not in React component)
		let childrenWithProps = React.Children.map(this.props.children, child => React.cloneElement(child, {}));
		*/

		const { match: { path } } = this.props;

		return (
			<div className='app-container'>
				{ this.state.hasError
					?	<div className='error-display'>{this.state.hasError.message}</div>
					:	(<>
							<Header { ...this.props } />
							<Switch>
								<Route path={ path } exact component={ HomePage } />
								<Route path={ `${path}:owner/:projectId` } component={ ProjectPage } />
								<Route path={ `${path}:owner/:projectId/:proposalId` } component={ ProposalPage } />
								<Route path={ `${path}auth` } component={ Auth } />
							</Switch>
							{ /*childrenWithProps*/ }
						</>)
				}
			</div>
		);

	}
}

export default App;
