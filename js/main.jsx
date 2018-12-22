import '@babel/polyfill';
import React from 'react';	// needed to parse JSX below
import { render } from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { routerReducer, syncHistoryWithStore } from 'react-router-redux';
import { createHashHistory } from 'history';

import App from './views/App.jsx';
import Auth from './views/Auth.jsx';
import HomePage from './views/HomePage.jsx';
import ProjectPage from './views/ProjectPage.jsx';
import ProposalPage from './views/ProposalPage.jsx';
import RouteNotFound from './views/404.jsx';

import reducers, { initialState } from './models/reducers';
import actionCreator from './models/actions';
import transport from './models/transport';
import middleware from './models/middleware';
import auth from './models/auth';
import appConfig from '../static/appConfig.json';

// Use the config corresponding to the runtime environment
auth.init(appConfig.auth[process.env.NODE_ENV === 'production' ? 'prod' : 'dev']);

// Create the single store for this application session
const store = createStore(
	combineReducers({
		...reducers,
		routing: routerReducer
	}),
	initialState,
	applyMiddleware(...middleware)
);

// Create the single action creator and transport layer for this application session
const actions = actionCreator(store, transport({
	expiration: 60000
}));

// set up hash history without querystring cruft (e.g. ?_k=xi50sh)
// from: https://github.com/reactjs/react-router/blob/master/upgrade-guides/v2.0.0.md#using-custom-histories
const appHistory = useRouterHistory(createHashHistory)({
	// queryKey: false	// deprecated in 
});
syncHistoryWithStore(appHistory, store);

// Pass the session store and actionCreator into
// every component created by `react-router`.
// Within each component, the store and action creator
// will be available as `props.store` / `props.actions`.
const createReduxComponent = (Component, props) => {
	let propsWithStore = Object.assign({}, props, { store, actions });
	return <Component { ...propsWithStore } />;
};

// Render the app as `react-router` <Route>s, within a <Router>
render((
	<Router history={ appHistory } createElement={ createReduxComponent }>
		<Route path='/' component={ App }>
			<IndexRoute component={ HomePage } />
			<Route path={ '/:owner/:projectId' } component={ ProjectPage } />
			<Route path={ '/:owner/:projectId/:proposalId' } component={ ProposalPage } />
			<Route path={ 'auth' } component={ Auth } />
		</Route>
		<Route path='*' component={ RouteNotFound } />
	</Router>
), document.getElementById('app'));
