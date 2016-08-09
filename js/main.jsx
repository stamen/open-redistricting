import 'babel-polyfill';
import React from 'react';	// needed to parse JSX below
import { render } from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import { routerReducer, syncHistoryWithStore } from 'react-router-redux';

import App from './views/App.jsx';
import HomePage from './views/HomePage.jsx';
import ProjectPage from './views/ProjectPage.jsx';
import ProposalPage from './views/ProposalPage.jsx';
import RouteNotFound from './views/404.jsx';

import reducers, { initialState } from './models/reducers';
import actionCreator from './models/actions';
import transport from './models/transport';
import middleware from './models/middleware';

// Create the single store for this application session
const store = createStore(
	combineReducers({
		...reducers,
		routing: routerReducer
	}),
	initialState
	// applyMiddleware(...middleware)
);

// Create the single action creator for this application session
const actions = actionCreator(store);

// Set up a history object whose state will stay in sync with the store,
// using `react-router-redux`. Optionally specify a base path
// as an environment variable.
const browserHistory = useRouterHistory(createHistory)({
	basename: process.env.BASE_URL || '/'
});
const history = syncHistoryWithStore(browserHistory, store);

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
	<Router history={ history } createElement={ createReduxComponent }>
		<Route path='/' component={ App }>
			<IndexRoute component={ HomePage } />
			<Route path={ 'project(/:projectId)' } component={ ProjectPage } />
			<Route path={ 'proposal(/:proposalId)' } component={ ProposalPage } />
		</Route>
		<Route path='*' component={ RouteNotFound } />
	</Router>
), document.getElementById('app'));
