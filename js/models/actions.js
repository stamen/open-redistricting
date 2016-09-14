import moment from 'moment';
import slug from 'slug';

import appConfig, { githubOrgName } from '../../static/appConfig.json';
import auth from './auth';
import {
	deriveProjectId,
	deriveProposalId
} from './reducers';

// read
export const PROJECT_LIST_REQUESTED = 'PROJECT_LIST_REQUESTED';
export const PROJECT_LIST_RESPONDED = 'PROJECT_LIST_RESPONDED';
export const PROJECT_REQUESTED = 'PROJECT_REQUESTED';
export const PROJECT_RESPONDED = 'PROJECT_RESPONDED';
export const PROPOSAL_REQUESTED = 'PROPOSAL_REQUESTED';
export const PROPOSAL_RESPONDED = 'PROPOSAL_RESPONDED';
export const VIEWER_INFO_REQUESTED = 'VIEWER_INFO_REQUESTED';
export const VIEWER_INFO_RESPONDED = 'VIEWER_INFO_RESPONDED';

// create
export const CREATE_PROJECT_REQUESTED = 'CREATE_PROJECT_REQUESTED';
export const CREATE_PROJECT_RESPONDED = 'CREATE_PROJECT_RESPONDED';
export const CREATE_PROPOSAL_REQUESTED = 'CREATE_PROPOSAL_REQUESTED';
export const CREATE_PROPOSAL_RESPONDED = 'CREATE_PROPOSAL_RESPONDED';

export default function (store, transport) {

	return {

		// ================================================
		// READ METHODS
		// ================================================

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
		requestProject (projectId) {

			let projectKey = deriveProjectId(githubOrgName, projectId);
			store.dispatch({
				type: PROJECT_REQUESTED,
				meta: { projectKey }
			});

			Promise.all([
				transport.request(`https://api.github.com/repos/${ githubOrgName }/${ projectId }`, this.parseProjectMetadata, this.buildAuthHeader()),
				// transport.request(`https://api.github.com/repos/${ githubOrgName }/${ projectId }/contents`, this.parseProjectContents, this.buildAuthHeader()),
				transport.request(`https://api.github.com/repos/${ githubOrgName }/${ projectId }/pulls`, this.parseProjectProposals, this.buildAuthHeader())
			])
			.then(
				responses => {
					// console.log(">>>>> received project metadata:", response);
					store.dispatch({
						type: PROJECT_RESPONDED,
						meta: { projectKey },
						payload: {
							metadata: responses[0],
							proposals: responses[1]
							// contents: responses[1],
							// proposals: responses[2]
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
		requestProposal (projectId, proposalId) {

			let proposalKey = deriveProposalId(githubOrgName, projectId, proposalId);
			store.dispatch({
				type: PROPOSAL_REQUESTED,
				meta: { proposalKey }
			});

			let url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/pulls/${ proposalId }`;

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

		/**
		 * Determine if the authorized user is a member of the 'open-redist' organization.
		 * If so, additionally checks response headers for write access (the 'public_repo' OAuth scope);
		 * if write access is not yet granted, will push the user through the OAuth flow one more time
		 * with increased permissions.
		 * If the user is a member and is successfully granted, or already has, write access,
		 * the `viewer` object in the store will have its `isMember` flag set to `true`.
		 */
		authedUserIsMember () {

			store.dispatch({
				type: VIEWER_INFO_REQUESTED
			});

			let token = auth.getToken();
			if (!token) {
				// viewer is not currently logged in
				setTimeout(() => {
					store.dispatch({
						type: VIEWER_INFO_RESPONDED,
						payload: { isMember: false }
					});
				}, 1);
				return;
			};

			// Get basic info about the authed user...
			let url = 'https://api.github.com/user';
			transport.request(url, null, this.buildAuthHeader())
			.then(
				response => {
					// ...and use that to determine if the user is part of the organization.
					url = `https://api.github.com/orgs/${ githubOrgName }/public_members/${ response.login }`;
					return transport.request(url, null, {
						...this.buildAuthHeader(),
						statusOnly: true
					});
				},
				error => {
					// NOTE: we could get here if the access token expired, so need to handle this case
					// (possibly by redirecting to /login).
					// TODO: handle with general need-to-login redirect when implemented.
					console.error(">>>>> ERROR GETTING AUTHED USER");
					store.dispatch({
						type: VIEWER_INFO_RESPONDED,
						payload: { isMember: false }
					});
				}
			)
			.then(
				// If the user is part of the org, ensure write access.
				response => {
					// Check 'x-oauth-scopes' header for 'public_repo' scope.
					let authedScopes = response.headers.get('x-oauth-scopes');
					if (!~authedScopes.indexOf('public_repo')) {
						// Authed user is part of the org, but does not yet have write access.
						// Send through OAuth flow one more time, requesting the proper scope.
						auth.authorize(true, ['public_repo']);
					} else {
						// Authed user is part of the org and has write access. Hooray!
						store.dispatch({
							type: VIEWER_INFO_RESPONDED,
							payload: { isMember: true }
						});
					}
				},
				error => {
					store.dispatch({
						type: VIEWER_INFO_RESPONDED,
						payload: { isMember: false }
					});
				}
			)
			.catch(error => {
				// fail loudly if the application errors in response to the
				// reducer state change triggered by the successful store.dispatch
				throw error;
			});

		},

		fetchJSON (path) {

			return transport.request(path);

		},



		// ================================================
		// WRITE METHODS
		// ================================================

		/**
		 * Three steps to creating a new project (repository):
		 * 1. Create a new repository in the open-redist org
		 * 2. Commit a README file containing the project description
		 * 3. Commit a .geojson map
		 * 
		 * @param  {String} name          Human-readable name for the project; GitHub will slugify this and use as the id / url
		 * @param  {String} description   Text description of the project
		 * @param  {String} base64MapFile Base64-encoded .geojson file
		 */
		createProject (name, description, base64MapFile) {

			const readmeCommitMessage = 'Initial commit of README with name and description',
				mapCommitMessage = 'Initial commit of geojson map',
				readmePath = appConfig.readmeFilename,
				mapPath = appConfig.mapFilename;

			let projectResponse,
				projectId;

			store.dispatch({
				type: CREATE_PROJECT_REQUESTED
			});

			let url = `https://api.github.com/orgs/${ githubOrgName }/repos`;
			return transport.request(url, null, {
				...this.buildAuthHeader(),
				method: 'POST',
				body: JSON.stringify({
					name,				// GitHub will slugify this and use as the repo id
					description: name	// We use this field here as a human-readable name
				})
			})
			.then(
				response => {
					// Success creating repo. Commit the README...
					projectResponse = response;
					projectId = projectResponse.name;
					url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/contents/${ readmePath }`;
					return transport.request(url, null, {
						...this.buildAuthHeader(),
						method: 'PUT',
						body: JSON.stringify({
							path: readmePath,
							message: readmeCommitMessage,
							content: window.btoa(unescape(encodeURIComponent(description)))
						})
					});
				},
				error => {
					// NOTE: we could get here if the access token expired, so need to handle this case
					// (possibly by redirecting to /login).
					// TODO: handle with general need-to-login redirect when implemented.
					console.error("Error creating project (repository):", error);
					store.dispatch({
						type: CREATE_PROJECT_RESPONDED,
						error: error
					});
				}
			)
			.then(
				response => {
					// Success committing README. Commit the map...
					url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/contents/${ mapPath }`;
					return transport.request(url, null, {
						...this.buildAuthHeader(),
						method: 'PUT',
						body: JSON.stringify({
							path: mapPath,
							message: mapCommitMessage,
							content: base64MapFile
						})
					});
				}
				// don't need another error handler here for almost the same operation...
			)
			.then(
				response => {
					store.dispatch({
						type: CREATE_PROJECT_RESPONDED,
						payload: projectResponse
					});
				},
				error => {
					console.error("Error creating initial commits:", error);
					store.dispatch({
						type: CREATE_PROJECT_RESPONDED,
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

		/**
		 * Three steps to creating a new proposal (pull request):
		 * 1. Get the SHA of `master`
		 * 2. Create a new branch from `master`
		 * 3. Commit the updated .geojson map
		 * 4. Creat a pull request with the specified name and description
		 * 
		 * @param  {String} name          Human-readable name for the project; GitHub will slugify this and use as the id / url
		 * @param  {String} description   Text description of the project
		 * @param  {String} base64MapFile Base64-encoded .geojson file
		 * @param  {String} projectId     Project id for which to add a proposal
		 */
		createProposal (name, description, base64MapFile, projectId) {

			let branchName = slug(name).toLowerCase(),
				url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/git/refs/heads`;

			const mapCommitMessage = 'Update geojson map for new proposal `branchName`',
				mapPath = appConfig.mapFilename;

			store.dispatch({
				type: CREATE_PROJECT_RESPONDED
			});

			return transport.request(url, null, this.buildAuthHeader())
			.then(
				response => {
					console.log(`Creating branch with name: ${ branchName } ...`);
					debugger;
					let master = response.find(r => r.ref === 'refs/heads/master');
					if (!master) throw new Error('No `master` ref returned.');

					url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/git/refs`;
					return transport.request(url, null, {
						...this.buildAuthHeader(),
						method: 'POST',
						body: JSON.stringify({
							ref: `refs/heads/${ branchName }`,
							sha: master.object.sha
						})
					});
				}
			)
			.then(
				response => {
					console.log("Committing map to new branch...");

					//
					// TODO WEDS:
					// HTTP 422, "sha" wasn't supplied
					// https://developer.github.com/v3/repos/contents/
					// didn't think sha was required for this endpoint...not sure what it would be, but possibly branch HEAD sha?
					// 
					// ahhh, this should be an update, not a create.
					// I guess GH is treating this as an upsert and falling through to update,
					// since the URL to the endpoint is the same.
					// https://developer.github.com/v3/repos/contents/#update-a-file
					// 
					// clear out the branch and try, try again!
					// 

					debugger;
					url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/contents/${ mapPath }`;
					return transport.request(url, null, {
						...this.buildAuthHeader(),
						method: 'PUT',
						body: JSON.stringify({
							path: mapPath,
							message: mapCommitMessage,
							content: base64MapFile,
							branch: branchName
						})
					});
				}
			)
			.then(
				response => {
					console.log("Opening a PR...");
					debugger;
					url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/pulls`;
					return transport.request(url, null, {
						...this.buildAuthHeader(),
						method: 'POST',
						body: JSON.stringify({
							title: name,
							body: description,
							head: branchName,
							base: 'master'
						})
					});
				}
			)
			.then(
				response => {
					let proposalId = response.id,
						proposalKey = deriveProposalId(githubOrgName, projectId, proposalId);

					store.dispatch({
						type: CREATE_PROPOSAL_RESPONDED,
						meta: { proposalKey },
						payload: response
					});
				}
			)
			.catch(error => {
				store.dispatch({
					type: CREATE_PROPOSAL_RESPONDED,
					error: error
				});
				throw error;
			});

		},

		/**
		 * Checks if authed user already has write access (the 'public_repo' OAuth scope).
		 * If not, updates the authorization to include the 'public_repo' OAuth scope.
		 * See https://developer.github.com/v3/oauth/#scopes for more info.
		 * Returns a Promise that resolves once user has write access.
		 * 
		 * NOTE: Strangely, cannot check authorizations with tokens, only with basic username/password.
		 * 		 Therefore, this method remains unused (because it doesn't work).
		 */
		grantWriteAccess () {

			let clientId = appConfig.auth[process.env.NODE_ENV === 'production' ? 'prod' : 'dev'],
				url = 'https://api.github.com/authorizations';

			return transport.request(url)//, null, this.buildAuthHeader())
			.then(
				response => {
					debugger;
					let openRedistApp = response.find(authedApp => authedApp.app.client_id === clientId);

					if (!openRedistApp) throw new Error('User is not currently authed.');

					if (~openRedistApp.scopes.indexOf('public_repo')) {
						return { userHasWriteAccess: true };
					} else {
						url = `https://api.github.com/authorizations/${ openRedistApp.id }`;
						return transport.request(url, null, {
							...this.buildAuthHeader(),
							method: 'PATCH',
							body: {
								add_scopes: [ 'public_repo' ]
							}
						});
					}
				},
				error => {
					// NOTE: we could get here if the access token expired, so need to handle this case
					// (possibly by redirecting to /login).
					// TODO: handle with general need-to-login redirect when implemented.
					console.error("Error getting existing authorizations:", error);
					throw error;
				}
			)
			.then(
				response => {
					debugger;
					return { userHasWriteAccess: true };
				},
				error => {
					console.error("Error adding write access:", error);
					throw error;
				}
			)
			.catch(error => {
				// fail loudly if the application errors further down the promise chain.
				throw error;
			});

		},



		// ================================================
		// UTILITIES
		// ================================================

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
