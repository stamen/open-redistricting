import moment from 'moment';

// import appConfig from '../../static/config/appConfig.json';
import auth from './auth';

export const PROJECT_LIST_REQUESTED = 'PROJECT_LIST_REQUESTED';
export const PROJECT_LIST_RESPONDED = 'PROJECT_LIST_RESPONDED';
export const PROJECT_REQUESTED = 'PROJECT_REQUESTED';
export const PROJECT_RESPONDED = 'PROJECT_RESPONDED';
export const PROPOSAL_LIST_REQUESTED = 'PROPOSAL_LIST_REQUESTED';
export const PROPOSAL_LIST_RESPONDED = 'PROPOSAL_LIST_RESPONDED';
export const PROPOSAL_REQUESTED = 'PROPOSAL_REQUESTED';
export const PROPOSAL_RESPONDED = 'PROPOSAL_RESPONDED';

const GITHUB_ORG_NAME = 'open-redistricting';

export default function (store, transport) {

	return {

		/**
		 * Request all Open Redistricting projects.
		 * A "project" is a GitHub repository within the "open-redistricting" GitHub Organization.
		 */
		requestProjectList () {

			console.log('requestProjectList access token:', auth.getToken());
			return;

			store.dispatch({
				type: PROJECT_LIST_REQUESTED
			});

			let url = `http://api.github.com/orgs/${ GITHUB_ORG_NAME }/repos`;

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
		 * Request details for one Open Redistricting project.
		 */
		requestProject (owner, projectId) {

			store.dispatch({
				type: PROJECT_REQUESTED
			});

			let url = `http://api.github.com/repos/${ owner }/${ projectId }`;

			transport.request(url, this.parseProject)
			.then(
				response => {
					console.log(">>>>> received project:", response);
					store.dispatch({
						type: PROJECT_RESPONDED,
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROJECT_RESPONDED,
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

		parseProject (response) {

			// extract only the subset of data needed for this application
			return response.json()
			.then(json => {

				return json;

			});

		},

		/**
		 * Request all proposals for an Open Redistricting project.
		 * A "proposal" is a pull request (open or closed) on a GitHub "open-redistricting" repository.
		 */
		requestProposalList (owner, projectId) {

			let url = `http://api.github.com/repos/${ owner }/${ projectId }/pulls`;

			transport.request(url, this.parseProposalList)
			.then(
				response => {
					console.log(">>>>> received proposal list:", response);
					store.dispatch({
						type: PROPOSAL_LIST_RESPONDED,
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROPOSAL_LIST_RESPONDED,
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

		parseProposalList (response) {

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

			let url = `http://api.github.com/repos/${ owner }/${ projectId }/pulls/${ proposalId }`;

			transport.request(url, this.parseProposal)
			.then(
				response => {
					console.log(">>>>> received proposal:", response);
					store.dispatch({
						type: PROPOSAL_RESPONDED,
						payload: response
					});
				},
				error => {
					// Fail loudly on error
					store.dispatch({
						type: PROPOSAL_RESPONDED,
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
