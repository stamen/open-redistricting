import { LOCATION_CHANGE } from 'react-router-redux';

import * as actions from './actions';
// import appConfig from '../static/appConfig.json';

export default {

	urlState (state = [], action) {

		switch (action.type) {
			/*
			case LOCATION_CHANGE:

				let query = action.payload.query,
					pathname = action.payload.pathname;

				// normalize by trimming leading slash
				if (pathname[0] === '/') pathname = pathname.slice(1);

				return {
					...state,
					time: query.time,
					layers: query.layers ? query.layers.split(',') : undefined,
					category: pathname.split('/')[0],
					module: pathname.split('/')[1]
				};
			*/
			default:
				return {
					...state
				};
		}

	},

	projectList (state = {}, action) {
		switch (action.type) {

			case actions.PROJECT_LIST_REQUESTED:
			case actions.PROJECT_LIST_RESPONDED:
				return {
					...state,
					loading: action.type === actions.PROJECT_LIST_REQUESTED,
					error: action.error,
					data: action.payload
				};

			default:
				return {
					...state
				};

		}
	},


	projects (state = {}, action) {
		switch (action.type) {

			case actions.PROJECT_REQUESTED:
			case actions.PROJECT_RESPONDED:
				// TODO: cache project by id
				return {
					...state,
					loading: action.type === actions.PROJECT_REQUESTED,
					error: action.error,
					data: action.payload
				};

			default:
				return {
					...state
				};

		}
	},

	proposalList (state = {}, action) {
		switch (action.type) {

			case actions.PROPOSAL_LIST_REQUESTED:
			case actions.PROPOSAL_LIST_RESPONDED:
				return {
					...state,
					loading: action.type === actions.PROPOSAL_LIST_REQUESTED,
					error: action.error,
					data: action.payload
				};

			default:
				return {
					...state
				};

		}
	},

	proposals (state = {}, action) {
		switch (action.type) {

			case actions.PROPOSAL_REQUESTED:
			case actions.PROPOSAL_RESPONDED:
				// TODO: cache proposal by id
				return {
					...state,
					loading: action.type === actions.PROPOSAL_REQUESTED,
					error: action.error,
					data: action.payload
				};

			default:
				return {
					...state
				};

		}
	}

};

// Default values passed into reducers on store initialization (in `main.jsx`).
// These values will override the defaults specified in each reducer's argument list.
export const initialState = {

	// appConfig...

};