import '../scss/main.scss';

import React from 'react';	// needed to parse JSX below
import { render } from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { BrowserRouter, Route } from 'react-router-dom';
import { createHashHistory } from 'history';

import AppContext from './context';
import App from './views/App.jsx';

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

// TODO: use react-redux / connect instead of this custom solution
// of passing the store via context and subscribing to it.
const contextValues = { store, actions };
render((
	<AppContext.Provider value={ contextValues }>
		<BrowserRouter>
			<Route path='/' component={ App } />
		</BrowserRouter>
	</AppContext.Provider>
), document.getElementById('app'));	
