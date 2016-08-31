import moment from 'moment';

import { githubOrgName } from '../../static/appConfig.json';
import auth from './auth';
import { deriveProjectId } from './reducers';

export const PROJECT_LIST_REQUESTED = 'PROJECT_LIST_REQUESTED';
export const PROJECT_LIST_RESPONDED = 'PROJECT_LIST_RESPONDED';
export const PROJECT_METADATA_REQUESTED = 'PROJECT_METADATA_REQUESTED';
export const PROJECT_METADATA_RESPONDED = 'PROJECT_METADATA_RESPONDED';
export const PROJECT_CONTENTS_REQUESTED = 'PROJECT_CONTENTS_REQUESTED';
export const PROJECT_CONTENTS_RESPONDED = 'PROJECT_CONTENTS_RESPONDED';
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
					// console.log(">>>>> received project list:", response);
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

			let projectKey = deriveProjectId(owner, projectId);
			store.dispatch({
				type: PROJECT_METADATA_REQUESTED,
				meta: { projectKey }
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
					// console.log(">>>>> received project metadata:", response);
					store.dispatch({
						type: PROJECT_METADATA_RESPONDED,
						meta: { projectKey },
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROJECT_METADATA_RESPONDED,
						meta: { projectKey },
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
		 * Request file list for an Open Redistricting project.
		 */
		requestProjectContents (owner, projectId) {

			let projectKey = deriveProjectId(owner, projectId);
			store.dispatch({
				type: PROJECT_CONTENTS_REQUESTED,
				meta: { projectKey }
			});

			let url = `https://api.github.com/repos/${ owner }/${ projectId }/contents`;

			transport.request(url, this.parseProjectContents)
			.then(
				response => {
					// console.log(">>>>> received project contents:", response);
					store.dispatch({
						type: PROJECT_CONTENTS_RESPONDED,
						meta: { projectKey },
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROJECT_CONTENTS_RESPONDED,
						meta: { projectKey },
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

		parseProjectContents (response) {

			// extract only the subset of data needed for this application
			return response.json()
			.then(json => {

				return {
					all: json,
					map: json.find(d => d.name.slice(-7) === 'geojson')
				};

			});

		},

		/**
		 * Request all proposals for an Open Redistricting project.
		 * A "proposal" is a pull request (defaults to return only open requests) on a GitHub "open-redist" repository.
		 */
		requestProjectProposals (owner, projectId) {

			let projectKey = deriveProjectId(owner, projectId);
			store.dispatch({
				type: PROJECT_PROPOSALS_REQUESTED,
				meta: { projectKey }
			});

			let url = `https://api.github.com/repos/${ owner }/${ projectId }/pulls`;

			transport.request(url, this.parseProjectProposals)
			.then(
				response => {
					// console.log(">>>>> received project proposals:", response);
					store.dispatch({
						type: PROJECT_PROPOSALS_RESPONDED,
						meta: { projectKey },
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROJECT_PROPOSALS_RESPONDED,
						meta: { projectKey },
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

				return json.reduce((acc, proposal) => {
					acc[proposal.number] = proposal;
					return acc;
				}, {});

			});

		},

		/**
		 * Request details for one proposal for an Open Redistricting project.
		 * A "proposal" is a pull request on a GitHub "open-redist" repository.
		 */
		requestProposal (owner, projectId, proposalId) {

			let projectKey = deriveProjectId(owner, projectId);
			store.dispatch({
				type: PROPOSAL_REQUESTED,
				meta: { projectKey, proposalId }
			});

			let url = `https://api.github.com/repos/${ owner }/${ projectId }/pulls/${ proposalId }`;

			transport.request(url, this.parseProposal)
			.then(
				response => {
					// console.log(">>>>> received proposal:", response);
					store.dispatch({
						type: PROPOSAL_RESPONDED,
						meta: { projectKey, proposalId },
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROPOSAL_RESPONDED,
						meta: { projectKey, proposalId },
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

		},

		requestProposalRevisions (proposal) {

			console.log(">>>>> TODO: fetch proposal revisions from:", proposal.commits_url);
			// TODO: fetch commits (revisions) and add to project > proposal > in reducers;
			// 		 need to refactor / split up the increasingly massive projects reducers
			// 		 while doing this.

		},

		requestProposalComments (proposal) {

			console.log(">>>>> TODO: fetch proposal comments from:", proposal.comments_url);
			// TODO: fetch comments and add to project > proposal > in reducers;
			// 		 need to refactor / split up the increasingly massive projects reducers
			// 		 while doing this.

		},

		fetchJSON (path) {

			return transport.request(path);

		}

	};

};
