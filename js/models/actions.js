import moment from 'moment';

import { githubOrgName } from '../../static/appConfig.json';
import auth from './auth';
import { deriveProjectId } from './reducers';

export const PROJECT_LIST_REQUESTED = 'PROJECT_LIST_REQUESTED';
export const PROJECT_LIST_RESPONDED = 'PROJECT_LIST_RESPONDED';
export const PROJECT_METADATA_REQUESTED = 'PROJECT_METADATA_REQUESTED';
export const PROJECT_METADATA_RESPONDED = 'PROJECT_METADATA_RESPONDED';
export const PROJECT_PROPOSALS_REQUESTED = 'PROJECT_PROPOSALS_REQUESTED';
export const PROJECT_PROPOSALS_RESPONDED = 'PROJECT_PROPOSALS_RESPONDED';
export const PROPOSAL_REQUESTED = 'PROPOSAL_REQUESTED';
export const PROPOSAL_RESPONDED = 'PROPOSAL_RESPONDED';

export default function (store, transport) {

	return {

		/**
		 * Request all Open Redistricting projects.
		 * A "project" is a GitHub repository within the "open-redist" GitHub Organization.
		 */
		requestProjectList () {

			store.dispatch({
				type: PROJECT_LIST_REQUESTED
			});

			let url = `https://api.github.com/orgs/${ githubOrgName }/repos`;

			transport.request(url, this.parseProjectList)
			.then(
				response => {
					console.log(">>>>> received project list:", response);
					store.dispatch({
						type: PROJECT_LIST_RESPONDED,
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROJECT_LIST_RESPONDED,
						error: error
					});
				}
			)
			.catch(error => {
				// fail loudly if the application errors in response to the
				// reducer state change triggered by the successful store.dispatch
				throw error;
			});

		},

		parseProjectList (response) {

			// extract only the subset of data needed for this application
			return response.json()
			.then(json => {

				return json;

			});

		},

		/**
		 * Request metadata for one Open Redistricting project (repository).
		 */
		requestProjectMetadata (owner, projectId) {

			let id = deriveProjectId(owner, projectId);
			store.dispatch({
				type: PROJECT_METADATA_REQUESTED,
				meta: { id }
			});

			let url = `https://api.github.com/repos/${ owner }/${ projectId }`;

			/*
			// not an authed call after all...
			// but if it was, here's how we'd do it:
			// TODO: abstract into transport layer
			let headers = new Headers();
			headers.append('Authorization', `token ${ auth.getToken() }`);
			transport.request(url, this.parseProject, { headers })
			*/

			transport.request(url, this.parseProjectMetadata)
			.then(
				response => {
					console.log(">>>>> received project metadata:", response);
					store.dispatch({
						type: PROJECT_METADATA_RESPONDED,
						meta: { id },
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROJECT_METADATA_RESPONDED,
						meta: { id },
						error: error
					});
				}
			)
			.catch(error => {
				// fail loudly if the application errors in response to the
				// reducer state change triggered by the successful store.dispatch
				throw error;
			});

		},

		parseProjectMetadata (response) {

			// extract only the subset of data needed for this application
			return response.json()
			.then(json => {

				return json;

			});

		},

		/**
		 * Request all proposals for an Open Redistricting project.
		 * A "proposal" is a pull request (defaults to return only open requests)
		 * on a GitHub "open-redist" repository.
		 * TODO: sort with `sort:updated` (https://developer.github.com/v3/pulls/#list-pull-requests)
		 */
		requestProjectProposals (owner, projectId) {

			let id = deriveProjectId(owner, projectId);
			store.dispatch({
				type: PROJECT_PROPOSALS_REQUESTED,
				meta: { id }
			});

			let url = `https://api.github.com/repos/${ owner }/${ projectId }/pulls`;

			transport.request(url, this.parseProjectProposals)
			.then(
				response => {
					console.log(">>>>> received project proposals:", response);
					store.dispatch({
						type: PROJECT_PROPOSALS_RESPONDED,
						meta: { id },
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROJECT_PROPOSALS_RESPONDED,
						meta: { id },
						error: error
					});
				}
			)
			.catch(error => {
				// fail loudly if the application errors in response to the
				// reducer state change triggered by the successful store.dispatch
				throw error;
			});

		},

		parseProjectProposals (response) {

			// extract only the subset of data needed for this application
			return response.json()
			.then(json => {

				return json;

			});

		},

		/**
		 * Request details for one proposal for an Open Redistricting project.
		 */
		requestProposal (owner, projectId, proposalId) {

			// TODO: implement
			let id = deriveProposalId(owner, projectId, proposalId);
			store.dispatch({
				type: PROPOSAL_REQUESTED,
				meta: { id }
			});

			let url = `https://api.github.com/repos/${ owner }/${ projectId }/pulls/${ proposalId }`;

			transport.request(url, this.parseProposal)
			.then(
				response => {
					console.log(">>>>> received proposal:", response);
					store.dispatch({
						type: PROPOSAL_RESPONDED,
						meta: { id },
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROPOSAL_RESPONDED,
						meta: { id },
						error: error
					});
				}
			)
			.catch(error => {
				// fail loudly if the application errors in response to the
				// reducer state change triggered by the successful store.dispatch
				throw error;
			});

		},

		parseProposal (response) {

			// extract only the subset of data needed for this application
			return response.json()
			.then(json => {

				return json;

			});

		}

	};

};
