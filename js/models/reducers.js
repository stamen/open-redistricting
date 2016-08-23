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

			default:
				return {
					...state
				};

		}
	},

	// TODO: break this into nested / combined reducers, this is becoming illegible
	projects (state = {}, action) {
		let existing;
		switch (action.type) {

			case actions.PROJECT_METADATA_REQUESTED:
			case actions.PROJECT_METADATA_RESPONDED:
				existing = state[action.meta.projectKey] || {};
				return {
					...state,
					[action.meta.projectKey]: {
						...existing,
						loading: action.type === actions.PROJECT_METADATA_REQUESTED,
						error: action.error,
						data: {
							...existing.data,
							...action.payload
						}
					}
				};

			case actions.PROJECT_PROPOSALS_REQUESTED:
			case actions.PROJECT_PROPOSALS_RESPONDED:
				existing = state[action.meta.projectKey] || {};
				return {
					...state,
					[action.meta.projectKey]: {
						...existing,
						proposals: {
							loading: action.type === actions.PROJECT_PROPOSALS_REQUESTED,
							error: action.error,
							data: {
								...(existing.proposals && existing.proposals.data || {}),
								...action.payload
							}
						}
					}
				};

			case actions.PROPOSAL_REQUESTED:
			case actions.PROPOSAL_RESPONDED:
				existing = state[action.meta.projectKey] || {};
				let existingProposal = existing.proposals && existing.proposals[action.meta.proposalId] || {};
				return {
					...state,
					[action.meta.projectKey]: {
						...existing,
						proposals: {
							loading: action.type === actions.PROPOSAL_REQUESTED,
							error: action.error,
							data: {
								...(existing.proposals && existing.proposals.data || {}),
								[action.meta.proposalId]: {
									...existingProposal,
									...action.payload
								}
							}
						}
					}
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
	// appConfig...
};

export function deriveProjectId (owner, projectId) {
	return `${ owner }-${ projectId }`;
}

/*
export function deriveProposalId (owner, projectId, proposalId) {
	return `${ owner }-${ projectId }-${ proposalId }`;
}
*/
