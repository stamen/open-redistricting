import '@babel/polyfill';
import React from 'react';	// needed to parse JSX below
import { render } from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
// import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
// import { routerReducer, syncHistoryWithStore } from 'react-router-redux';
import { createHashHistory } from 'history';

import AppContext from './context';
import App from './views/App.jsx';
// import Auth from './views/Auth.jsx';
// import HomePage from './views/HomePage.jsx';
// import ProjectPage from './views/ProjectPage.jsx';
// import ProposalPage from './views/ProposalPage.jsx';
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
		...reducers
	}),
	initialState,
	applyMiddleware(...middleware)
);

// Create the single action creator and transport layer for this application session
const actions = actionCreator(store, transport({
	expiration: 60000
}));

/*
// set up hash history without querystring cruft (e.g. ?_k=xi50sh)
// from: https://github.com/reactjs/react-router/blob/master/upgrade-guides/v2.0.0.md#using-custom-histories
const appHistory = useRouterHistory(createHashHistory)({
	// queryKey: false	// deprecated in 
});
syncHistoryWithStore(appHistory, store);
*/

// const { Consumer, Provider } = React.createContext();
// export {
// 	Consumer as AppConsumer,
// 	Provider as AppProvider,
// };
// export const AppContext = React.createContext();
// Pass the session store and actionCreator into
// every component created by `react-router`.
// Within each component, the store and action creator
// will be available as `props.store` / `props.actions`.
// const createReduxComponent = (Component, props) => {
// 	let propsWithStore = Object.assign({}, props, { store, actions });
// 	return <Component { ...propsWithStore } />;
// };

//
// TODO NEXT: i set up this custom alternative to Redux connect
// with react-router v3. not sure if it still works in v4;
// appears not to be, since props.store doesn't exist in App ctor.
//
// Should also consider refining this pattern;
// currently only using store.subscribe (once) and store.getState().
// Can probably make this a bit tighter, to avoid direct store access
// from within component tree.
//
// ...looks like `createElement` doesn't exist in v4
// https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/BrowserRouter.md
// probably because *Router components are now _actually_ components,
// and therefore have no knowledge of how child components are created.
// will have to find a new way to implement this pattern,
// or some other (off-the-shelf) solution.
//
// Possibly use render prop? That's ok for functional components...
// https://tylermcginnis.com/react-router-pass-props-to-components/
// worth looking at components we have now and seeing how many can become functional.
// Careful going down this road tho, there are other questionable decisions
// already in the codebase (see e.g. storing state on `this` in ProjectPage)
// and this could easily become a rabbit hole.
//
// Probably the best solution is to find some lightweight, imperfect solution,
// possibly totally hand-rolled, and move forward with that.
// The fact that only store.subscribe, store.getState, and actions are used
// by downstream components may help figure out what this new solution is.
//

const contextValues = { store, actions };
render((
	<AppContext.Provider value={ contextValues }>
		<BrowserRouter>
			<Switch>
				<Route path='/' exact component={ App } />
				<Route path='*' component={ RouteNotFound } />
			</Switch>
		</BrowserRouter>
	</AppContext.Provider>
), document.getElementById('app'));	

/*
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
*/