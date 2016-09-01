import moment from 'moment';

import { githubOrgName } from '../../static/appConfig.json';
import auth from './auth';
import {
	deriveProjectId,
	deriveProposalId
} from './reducers';

export const PROJECT_LIST_REQUESTED = 'PROJECT_LIST_REQUESTED';
export const PROJECT_LIST_RESPONDED = 'PROJECT_LIST_RESPONDED';
export const PROJECT_REQUESTED = 'PROJECT_REQUESTED';
export const PROJECT_RESPONDED = 'PROJECT_RESPONDED';
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

			transport.request(url, this.parseProjectList, this.buildAuthHeader())
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
		 * Request the following for one Open Redistricting project (repository):
		 * - metadata
		 * - file list
		 * - proposal list (A "proposal" is a pull request (defaults to return only open requests) on a GitHub "open-redist" repository)
		 */
		requestProject (owner, projectId) {

			let projectKey = deriveProjectId(owner, projectId);
			store.dispatch({
				type: PROJECT_REQUESTED,
				meta: { projectKey }
			});

			Promise.all([
				transport.request(`https://api.github.com/repos/${ owner }/${ projectId }`, this.parseProjectMetadata, this.buildAuthHeader()),
				transport.request(`https://api.github.com/repos/${ owner }/${ projectId }/contents`, this.parseProjectContents, this.buildAuthHeader()),
				transport.request(`https://api.github.com/repos/${ owner }/${ projectId }/pulls`, this.parseProjectProposals, this.buildAuthHeader())
			])
			.then(
				responses => {
					// console.log(">>>>> received project metadata:", response);
					store.dispatch({
						type: PROJECT_RESPONDED,
						meta: { projectKey },
						payload: {
							metadata: responses[0],
							contents: responses[1],
							proposals: responses[2]
						}
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROJECT_RESPONDED,
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

			return response.json()
			.then(json => json);

		},

		parseProjectContents (response) {

			// extract only the subset of data needed for this application
			return response.json()
			.then(json => ({
					all: json,
					map: json.find(d => d.name.slice(-7) === 'geojson')
			}));

		},

		parseProjectProposals (response) {

			// extract only the subset of data needed for this application
			return response.json()
			.then(json => json.reduce((acc, proposal) => {
				acc[proposal.number] = proposal;
				return acc;
			}, {}));

		},

		/**
		 * Request details for one proposal for an Open Redistricting project.
		 * A "proposal" is a pull request on a GitHub "open-redist" repository.
		 */
		requestProposal (owner, projectId, proposalId) {

			let proposalKey = deriveProposalId(owner, projectId, proposalId);
			store.dispatch({
				type: PROPOSAL_REQUESTED,
				meta: { proposalKey }
			});

			let url = `https://api.github.com/repos/${ owner }/${ projectId }/pulls/${ proposalId }`;

			transport.request(url, this.parseProposal, this.buildAuthHeader())
			.then(
				response => {
					// console.log(">>>>> received proposal:", response);
					store.dispatch({
						type: PROPOSAL_RESPONDED,
						meta: { proposalKey },
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROPOSAL_RESPONDED,
						meta: { proposalKey },
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

		},

		/**
		 * Authentication is not necessary for many GitHub API methods,
		 * but go ahead and auth calls if logged in because
		 * GitHub grants higher rate limits for authed calls.
		 */
		buildAuthHeader () {

			let token = auth.getToken();
			if (token) {

				let headers = new Headers();
				headers.append('Authorization', `token ${ token }`);
				return { headers };

			} else {

				return null;

			}

		}

	};

};
