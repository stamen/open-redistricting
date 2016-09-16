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
					loading: action.type === actions.CREATE_PROJECT_REQUESTED,
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

			case actions.CREATE_PROPOSAL_REQUESTED:
			case actions.CREATE_PROPOSAL_RESPONDED:
				if (!action.meta || !action.meta.projectKey) return { ...state };
				let existingProject = state[action.meta.projectKey];
				if (!existingProject) return { ...state };

				let proposals = { ...existingProject.proposals };
				if (action.payload) proposals[action.payload.number] = action.payload;

				// add new proposal to project.proposals
				return {
					...state,
					[action.meta.projectKey]: {
						...existingProject,
						loading: action.type === actions.CREATE_PROPOSAL_REQUESTED,
						error: action.error,
						proposals
					}
				};

			default:
				return {
					...state
				};

		}
	},

	proposals (state = {}, action) {
		let existingProposal,
			comments;

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

			case actions.CREATE_COMMENT_REQUESTED:
			case actions.CREATE_COMMENT_RESPONDED:
				if (!action.meta.proposalKey) return { ...state };
				existingProposal = { ...state[action.meta.proposalKey] };
				if (!existingProposal) return { ...state };

				comments = existingProposal.comments;
				if (action.payload) comments.push(action.payload);

				// add new comment to existingProposal.comments
				return {
					...state,
					[action.meta.proposalKey]: {
						...existingProposal,
						loading: action.type === actions.CREATE_COMMENT_REQUESTED,
						error: action.error,
						comments
					}
				};

			case actions.CREATE_PROPOSAL_REACTION_REQUESTED:
			case actions.CREATE_PROPOSAL_REACTION_RESPONDED:
				if (!action.meta.proposalKey) return { ...state };
				existingProposal = { ...state[action.meta.proposalKey] };
				if (!existingProposal) return { ...state };

				// keep the reducer pure:
				// return only copies, not originals
				comments = [ ...existingProposal.comments ];
				let reactions = [ ...existingProposal.reactions ];
				if (action.meta.commentId) {
					if (action.payload) {
						comments = comments.map(c => {
							return (c.id === action.meta.commentId) ? { ...action.payload } : { ...c };
						});
					}
				} else {
					if (action.payload) {
						reactions = [ ...action.payload ];
					}
				}

				// add updated comment to existingProposal.comments,
				// and updated reactions list to existingProposal
				return {
					...state,
					[action.meta.proposalKey]: {
						...existingProposal,
						loading: action.type === actions.CREATE_PROPOSAL_REACTION_REQUESTED,
						error: action.error,
						comments,
						reactions
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
