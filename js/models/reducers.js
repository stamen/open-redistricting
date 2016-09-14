import { LOCATION_CHANGE } from 'react-router-redux';

import * as actions from './actions';
// import appConfig from '../static/appConfig.json';

let reduced = {

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
					data: (action.payload || null)
				};

			case actions.CREATE_PROJECT_REQUESTED:
			case actions.CREATE_PROJECT_RESPONDED:
				return {
					...state,
					loading: action.type === actions.PROJECT_LIST_REQUESTED,
					error: action.error,
					data: action.payload ? (state.data || []).concat([action.payload]) : state.data
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
				return {
					...state,
					[action.meta.projectKey]: {
						...(state[action.meta.projectKey] || {}),
						loading: action.type === actions.PROJECT_REQUESTED,
						error: action.error,
						...action.payload
					}
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
				return {
					...state,
					[action.meta.proposalKey]: {
						...(state[action.meta.proposalKey] || {}),
						loading: action.type === actions.PROPOSAL_REQUESTED,
						error: action.error,
						...action.payload
					}
				};

			case actions.CREATE_PROPOSAL_REQUESTED:
			case actions.CREATE_PROPOSAL_RESPONDED:
				if (!action.meta.proposalKey) return { ...state };
				
				return {
					...state,
					[action.meta.proposalKey]: {
						loading: action.type === actions.CREATE_PROPOSAL_REQUESTED,
						error: action.error,
						...action.payload
					}
				};

			default:
				return {
					...state
				};

		}
	},

	viewer (state = {}, action) {
		switch (action.type) {

			case actions.VIEWER_INFO_REQUESTED:
			case actions.VIEWER_INFO_RESPONDED:
				return {
					...state,
					loading: action.type === actions.VIEWER_INFO_REQUESTED,
					error: action.error,
					...action.payload
				};

			default:
				return {
					...state
				};

		}
	}

};

export default reduced;

// Default values passed into reducers on store initialization (in `main.jsx`).
// These values will override the defaults specified in each reducer's argument list.
export const initialState = {
	viewer: {
		isMember: undefined
	}
};

export function deriveProjectId (owner, projectId) {
	return `${ owner }-${ projectId }`;
}

export function deriveProposalId (owner, projectId, proposalId) {
	return `${ owner }-${ projectId }-${ proposalId }`;
}
