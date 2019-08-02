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
export const CREATE_PROPOSAL_REVISION_REQUESTED = 'CREATE_PROPOSAL_REVISION_REQUESTED';
export const CREATE_PROPOSAL_REVISION_RESPONDED = 'CREATE_PROPOSAL_REVISION_RESPONDED';
export const CREATE_COMMENT_REQUESTED = 'CREATE_COMMENT_REQUESTED';
export const CREATE_COMMENT_RESPONDED = 'CREATE_COMMENT_RESPONDED';
export const CREATE_PROPOSAL_REACTION_REQUESTED = 'CREATE_PROPOSAL_REACTION_REQUESTED';
export const CREATE_PROPOSAL_REACTION_RESPONDED = 'CREATE_PROPOSAL_REACTION_RESPONDED';

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
					this.handleError(error);

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
		 * - proposal list (A "proposal" is a pull request on a GitHub "open-redist" repository; we fetch all and filter down to open on response)
		 */
		requestProject (projectId) {

			let projectKey = deriveProjectId(githubOrgName, projectId);
			store.dispatch({
				type: PROJECT_REQUESTED,
				meta: { projectKey }
			});

			Promise.all([
				transport.request(`https://api.github.com/repos/${ githubOrgName }/${ projectId }`, this.parseProjectMetadata, this.buildAuthHeader()),
				transport.request(`https://api.github.com/repos/${ githubOrgName }/${ projectId }/pulls?state=all`, this.parseProjectProposals, this.buildAuthHeader())
			])
			.then(
				responses => {
					store.dispatch({
						type: PROJECT_RESPONDED,
						meta: { projectKey },
						payload: {
							metadata: responses[0],
							proposals: responses[1]
						}
					});
				},
				error => {
					this.handleError(error);
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
				// Filter down to only open pulls; we can later show closed pulls
				// and add a UI to reopen if desired.
				if (proposal.state === 'open') {
					acc[proposal.number] = proposal;
				}
				return acc;
			}, {}));

		},

		/**
		 * Request details for one proposal for an Open Redistricting project.
		 * A "proposal" is a pull request on a GitHub "open-redist" repository.
		 */
		requestProposal (projectId, proposalId) {

			let proposalKey = deriveProposalId(githubOrgName, projectId, proposalId),
				proposal;

			store.dispatch({
				type: PROPOSAL_REQUESTED,
				meta: { proposalKey }
			});

			let url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/pulls/${ proposalId }`,
				headers = this.buildAuthHeader().headers;

			// add custom Accept header to return reactions
			// per: https://developer.github.com/v3/issues/comments/#reactions-summary
			headers.append('Accept', 'application/vnd.github.squirrel-girl-preview');
			headers = { headers };

			transport.request(url, this.parseProposal, headers)
			.then(response => {

				proposal = { ...response };

				return transport.request(proposal.commits_url, this.parseProposal, headers);

			})
			.then(response => {

				proposal.commits = response;

				return transport.request(proposal.comments_url, this.parseProposal, headers);
				
			})
			.then(response => {

				proposal.comments = response;

				url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/issues/${ proposalId }/reactions`;
				return transport.request(url, this.parseProposal, headers);
				
			})
			.then(response => {

				proposal.reactions = response;

				store.dispatch({
					type: PROPOSAL_RESPONDED,
					meta: { proposalKey },
					payload: proposal
				});

			})
			.catch(error => {
				this.handleError(error);
				store.dispatch({
					type: PROPOSAL_RESPONDED,
					meta: { proposalKey },
					error: error
				});
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

		/**
		 * Get info about the authed user.
		 * Determine if the authorized user is a member of the 'open-redist' organization.
		 * If so, additionally checks response headers for write access (the 'public_repo' OAuth scope);
		 * if write access is not yet granted, will push the user through the OAuth flow one more time
		 * with increased permissions.
		 * If the user is a member and is successfully granted, or already has, write access,
		 * the `viewer` object in the store will have its `isMember` flag set to `true`.
		 */
		getViewer () {

			store.dispatch({
				type: VIEWER_INFO_REQUESTED
			});

			let token = auth.getToken(),
				user = {};

			if (!token) {
				// viewer is not currently logged in
				setTimeout(() => {
					store.dispatch({
						type: VIEWER_INFO_RESPONDED,
						payload: {
							isSignedIn: false,
							isMember: false
						}
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
					user = response;
					url = `https://api.github.com/orgs/${ githubOrgName }/public_members/${ response.login }`;
					return transport.request(url, null, {
						...this.buildAuthHeader(),
						statusOnly: true
					});
				},
				error => {

					console.error("Error getting authed user: ", error);
					this.handleError(error);
					store.dispatch({
						type: VIEWER_INFO_RESPONDED,
						payload: {
							isSignedIn: true,
							isMember: false
						}
					});

				}
			)
			.then(
				// If the user is part of the org, ensure write access.
				response => {
					// Check 'x-oauth-scopes' header for 'public_repo' scope.
					let authedScopes = response.headers.get('x-oauth-scopes');
					if (!authedScopes.includes('public_repo')) {
						// Authed user is part of the org, but does not yet have write access.
						// Send through OAuth flow one more time, requesting the proper scope.
						auth.authorize(true, ['public_repo']);
					} else {
						// Authed user is part of the org and has write access. Hooray!
						store.dispatch({
							type: VIEWER_INFO_RESPONDED,
							payload: {
								...user,
								isSignedIn: true,
								isMember: true
							}
						});
					}
				},
				error => {

					this.handleError(error);
					store.dispatch({
						type: VIEWER_INFO_RESPONDED,
						payload: {
							...user,
							isSignedIn: true,
							isMember: false
						}
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
		 * Steps to creating a new project (repository):
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

			// 1. Create a new repository in the open-redist org
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
					// 2. Commit a README file containing the project description
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
					this.handleError(error);
					throw new Error("Error creating project (repository): " + error.message);
				}
			)
			.then(
				response => {
					// 3. Commit a .geojson map
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
				},
				error => {
					this.handleError(error);
					throw new Error("Error committing README: " + error.message);
				}
			)
			.then(
				response => {
					store.dispatch({
						type: CREATE_PROJECT_RESPONDED,
						payload: projectResponse
					});
				},
				error => {
					this.handleError(error);
					throw new Error("Error committing map.geojson: " + error.message);
				}
			)
			.catch(error => {
				// fail loudly if the application errors in response to the
				// reducer state change triggered by the successful store.dispatch
				store.dispatch({
					type: CREATE_PROJECT_RESPONDED,
					error: error
				});
				throw error;
			});

		},

		/**
		 * Steps to creating a new proposal (pull request):
		 * 1. Get the SHA of `master`
		 * 2. Get the blob SHA for master/map.geojson
		 * 3. Create a new branch from `master`
		 * 4. Commit the updated .geojson map
		 * 5. Create a pull request with the specified name and description
		 * 
		 * @param  {String} name          Human-readable name for the project; GitHub will slugify this and use as the id / url
		 * @param  {String} description   Text description of the project
		 * @param  {String} base64MapFile Base64-encoded .geojson file
		 * @param  {String} projectId     Project id for which to add a proposal
		 * @param  {String} viewerId      id of the current user
		 */
		createProposal (name, description, base64MapFile, projectId, viewerId) {

			// 1a. Get the forks of the project /repos/:owner/:repo/forks and check if the current user has already forked this repo
			// 1b. If not, create a fork. /repos/:owner/:repo/forks Since forks are created asynchronously, have to poll until it's ready.
			// 2. Get a reference to the HEAD of master on the new fork once it is available
			// 3. Get the blob SHA for fork/master/map.geojson
			// 4. Create a new branch from fork/`master`
			// 5. Commit the updated .geojson map
			// 6. Create a pull request back to the `open-redist` repo with the specified name and description

			let branchName = slug(name).toLowerCase(),
				url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/forks`,
				masterSHA,
				mapBlobSHA;

			const projectKey = deriveProjectId(githubOrgName, projectId),
				mapCommitMessage = `Update geojson map for new proposal ${ branchName }`,
				mapPath = appConfig.mapFilename;

			store.dispatch({
				type: CREATE_PROPOSAL_REQUESTED
			});

			// 1. Get the existing forks of the project
			return transport.request(url, null, this.buildAuthHeader())
			.then(response => {

				// Check if the current user has already forked this repo
				let existingFork = response.find(f => f.owner.login === viewerId);
				if (existingFork) {
					// 1a. If a fork already exists, proceed.
					return Promise.resolve(response);
				} else {
					// 1b. If not, create a fork.
					return transport.request(url, null, {
						...this.buildAuthHeader(),
						method: 'POST'
					});
				}
			})
			.then(response => {

				// 2. Get a reference to the HEAD of master on the new fork.
				// Creating a fork runs as an asynchronous task on the backend,
				// so the ref may not be available immediately.
				// In that case, we poll for a valid ref and proceed once it is available.
				
				const startTime = new Date().getTime(),
					POLL_INTERVAL = 5000,
					MINUTES_TO_WAIT = 1;

				// TODO: this code could probably use a once-over by a Promise Master.
				// I am but a lowly Promise Acolyte.
				url = `https://api.github.com/repos/${ viewerId }/${ projectId }/git/refs/heads`;
				let getMasterHeadRef = () => {
					return new Promise((resolve, reject) => {

						transport.request(url, null, this.buildAuthHeader())
						.then(
							rsp => {
								resolve(rsp);
							},
							err => {
								// New fork is not yet ready.
								// Poll until it is, and resolve with a Promise that will resolve with the response.
								// However, if we've waited too long, reject.
								if (new Date().getTime() - startTime > MINUTES_TO_WAIT * 60 * 1000) {
									reject(new Error(`Creation of new fork timed out after ${ MINUTES_TO_WAIT } minutes.`));
								} else {
									resolve(new Promise((res, rej) => {
										setTimeout(() => {
											getMasterHeadRef()
											.then(
												rsp => res(rsp),
												err => rej(err)
											);
										}, POLL_INTERVAL)
									}));
								}
							}
						);

					});
				}

				return getMasterHeadRef();

			})
			.then(response => {

				// 3. Store the SHA for master on the new fork and 
				// get the blob SHA for master/map.geojson on the new fork
				let master = response.find(r => r.ref === 'refs/heads/master');
				if (!master) throw new Error('No `master` ref returned.');
				masterSHA = master.object.sha;

				url = `https://api.github.com/repos/${ viewerId }/${ projectId }/contents/`;
				return transport.request(url, null, this.buildAuthHeader());

			})
			.then(response => {

				// 4. Create a new branch from `master`
				let mapFileDescriptor = response.find(f => f.name === mapPath);
				mapBlobSHA = mapFileDescriptor ? mapFileDescriptor.sha : '';	// if map is not found, the following API call will be a
																				// create instead of update, which is unexpected but ok.
				url = `https://api.github.com/repos/${ viewerId }/${ projectId }/git/refs`;
				return transport.request(url, null, {
					...this.buildAuthHeader(),
					method: 'POST',
					body: JSON.stringify({
						ref: `refs/heads/${ branchName }`,
						sha: masterSHA
					})
				});

			})
			.then(response => {

				// 5. Commit the updated .geojson map
				url = `https://api.github.com/repos/${ viewerId }/${ projectId }/contents/${ mapPath }`;
				return transport.request(url, null, {
					...this.buildAuthHeader(),
					method: 'PUT',
					body: JSON.stringify({
						path: mapPath,
						message: mapCommitMessage,
						content: base64MapFile,
						branch: branchName,
						sha: mapBlobSHA
					})
				});

			})
			.then(response => {

				// 6. Create a pull request back to the `open-redist` repo with the specified name and description
				url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/pulls`;
				return transport.request(url, null, {
					...this.buildAuthHeader(),
					method: 'POST',
					body: JSON.stringify({
						title: name,
						body: description,
						head: `${ viewerId }:${ branchName }`,
						base: 'master'
					})
				});

			})
			.then(response => {

				// Proposal complete! Update the store.
				let proposalId = response.number,
					proposalKey = deriveProposalId(githubOrgName, projectId, proposalId);

				store.dispatch({
					type: CREATE_PROPOSAL_RESPONDED,
					meta: {
						projectKey,
						proposalKey
					},
					payload: response
				});

			})
			.catch(error => {

				this.handleError(error);
				store.dispatch({
					type: CREATE_PROPOSAL_RESPONDED,
					error: error
				});
				throw error;

			});

		},

		createProposalRevision (description, base64MapFile, projectId, proposalId, viewerId, proposal) {

			const proposalHeadSHA = proposal.commits[0].commit.tree.sha,
				branchName = proposal.head.ref,
				proposalKey = deriveProposalId(githubOrgName, projectId, proposalId),
				mapPath = appConfig.mapFilename;

			store.dispatch({
				type: CREATE_PROPOSAL_REVISION_REQUESTED,
				meta: { proposalKey }
			});

			// First, get the SHA of the map file at the head of this branch
			let url = `https://api.github.com/repos/${ viewerId }/${ projectId }/contents/?ref=${ branchName }`;
			return transport.request(url, null, this.buildAuthHeader())
			.then(response => {

				let mapFileDescriptor = response.find(f => f.name === mapPath);
				if (!mapFileDescriptor) throw new Error(`Map file "${ mapPath }" not present in ${ viewerId }/${ projectId }:${ branchName }`);
				
				// Then, commit the revised map file to this branch.
				url = `https://api.github.com/repos/${ viewerId }/${ projectId }/contents/${ mapPath }`;
				return transport.request(url, null, {
					...this.buildAuthHeader(),
					method: 'PUT',
					body: JSON.stringify({
						path: mapPath,
						message: description,
						content: base64MapFile,
						branch: branchName,
						sha: mapFileDescriptor.sha
					})
				});

			})
			.then(response => {

				// Revision complete.
				store.dispatch({
					type: CREATE_PROPOSAL_REVISION_RESPONDED,
					meta: { proposalKey },
					payload: response
				});

			})
			.catch(error => {

				this.handleError(error);
				store.dispatch({
					type: CREATE_COMMENT_RESPONDED,
					meta: { proposalKey },
					error: error
				});
				throw error;

			});

		},

		createProposalComment (body, projectId, proposalId) {

			let proposalKey = deriveProposalId(githubOrgName, projectId, proposalId);
			store.dispatch({
				type: CREATE_COMMENT_REQUESTED,
				meta: { proposalKey }
			});

			let url = `https://api.github.com/repos/${ githubOrgName }/${ projectId }/issues/${ proposalId }/comments`;
			return transport.request(url, null, {
				...this.buildAuthHeader(),
				method: 'POST',
				body: JSON.stringify({ body })
			})
			.then(response => {
				
				store.dispatch({
					type: CREATE_COMMENT_RESPONDED,
					meta: { proposalKey },
					payload: response
				});

			})
			.catch(error => {

				this.handleError(error);
				store.dispatch({
					type: CREATE_COMMENT_RESPONDED,
					meta: { proposalKey },
					error: error
				});
				throw error;

			});

		},

		createProposalReaction (reaction, projectId, proposalId, viewerId, commentId) {

			let proposalKey = deriveProposalId(githubOrgName, projectId, proposalId),
				url = commentId ? 
					`https://api.github.com/repos/${ githubOrgName }/${ projectId }/issues/comments/${ commentId }/reactions` :
					`https://api.github.com/repos/${ githubOrgName }/${ projectId }/issues/${ proposalId }/reactions`;

			store.dispatch({
				type: CREATE_PROPOSAL_REACTION_REQUESTED,
				meta: {
					proposalKey,
					commentId
				}
			});

			let headers = this.buildAuthHeader().headers;
			headers.append('Accept', 'application/vnd.github.squirrel-girl-preview');
			headers = { headers };
			
			return transport.request(url, null, {
				...headers,
				expiration: 0	// never persist this response in the cache; always fetch it fresh.
			})
			.then(response => {

				// Either create a new reaction or, if this reaction already exists
				// on this proposal/comment by this author, remove it.
				let existingReactionByViewer = response.find(r => r.user.login === viewerId && r.content === reaction);
				if (existingReactionByViewer) {

					// reaction already exists; delete it
					url = `https://api.github.com/reactions/${ existingReactionByViewer.id }`;
					return transport.request(url, null, {
						...headers,
						method: 'DELETE',
						statusOnly: true
					});

				} else {

					// reaction doesn't yet exist; create it
					url = commentId ? 
						`https://api.github.com/repos/${ githubOrgName }/${ projectId }/issues/comments/${ commentId }/reactions` :
						`https://api.github.com/repos/${ githubOrgName }/${ projectId }/issues/${ proposalId }/reactions`;
					return transport.request(url, null, {
						...headers,
						method: 'POST',
						body: JSON.stringify({ content: reaction })
					});

				}

			})
			.then(response => {

				// get the end result from the server so we're sure to be in sync,
				// whether we just created or deleted a reaction.
				// (Unfortunately, Reactions API doesn't return the whole context, just the single reaction.)
				url = commentId ? 
					`https://api.github.com/repos/${ githubOrgName }/${ projectId }/issues/comments/${ commentId }` :
					`https://api.github.com/repos/${ githubOrgName }/${ projectId }/issues/${ proposalId }/reactions`
				return transport.request(url, null, {
					...headers,
					expiration: 0	// never persist this response in the cache; always fetch it fresh.
				});

			})
			.then(response => {

				store.dispatch({
					type: CREATE_PROPOSAL_REACTION_RESPONDED,
					meta: {
						proposalKey,
						commentId
					},
					// If reaction is on a comment, payload is the updated comment;
					// if reaction is on a proposal, payload is the reactions list on that proposal.
					payload: response
				});

			})
			.catch(error => {

				this.handleError(error);
				store.dispatch({
					type: CREATE_PROPOSAL_REACTION_RESPONDED,
					meta: {
						proposalKey,
						commentId
					},
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
					let openRedistApp = response.find(authedApp => authedApp.app.client_id === clientId);

					if (!openRedistApp) throw new Error('User is not currently authed.');

					if (openRedistApp.scopes.includes('public_repo')) {
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
				}
			)
			.then(
				response => {
					return { userHasWriteAccess: true };
				}
			)
			.catch(error => {
				// fail loudly if the application errors further down the promise chain.
				this.handleError(error);
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

			let headers = new Headers(),
				token = auth.getToken();

			if (token) headers.append('Authorization', `token ${ token }`);

			return { headers };

		},

		handleError (error) {

			if (!error || !error.message) return;

			if (error.message.includes('401')) {

				// If 401 Unauthorized, assume the stored OAuth access token is stale.
				// Dump the token and refresh.
				auth.logout();
				window.location.reload(true);

			} else if (~error.message.indexOf('403')) {

				if (error.message.includes('rate limit')) {
					// If we've hit a rate limit, throw up the info modal and login CTA.
					// (As long as we're not already handling this case!)
					if (!window.location.search || window.location.search.indexOf('rateLimit') === -1) {
						window.location = window.location.origin + window.location.pathname + '?rateLimit=true';
					}
				}

			}

		}

	};

};
