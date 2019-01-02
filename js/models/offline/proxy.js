import { mapFilename } from '../../../static/appConfig.json';

const methodProxies = {
	authorizations: getAuthProxy,
	orgs: getOrgsProxy,
	rawContent: getRawContentProxy,
	reactions: getReactionsProxy,
	repos: getReposProxy,
	user: getUserProxy
};

/**
 * Map requests to local resources for offline development
 */
export function offline (url) {
	const path = url.split('/');
	const domain = path[2];
	const method = path[3];

	let responseBody;
	try {
		responseBody = getMethodProxy(domain, method)(path);
	} catch (error) {
		console.warn(error);
		responseBody = getPlaceholderProxy(path);
	}
	return Promise.resolve(buildResponse(responseBody));
}

function getMethodProxy(domain, method) {
	return domain === 'raw.githubusercontent.com'
		? methodProxies.rawContent
		: methodProxies[method] || getPlaceholderProxy;
}

function getPlaceholderProxy (path) {
	// TODO
}

function buildResponse (body) {
	// Note: this should return a new Response(), but I
	// couldn't get response.json() to resolve correctly.
	return {
		body,
		headers: new Headers({}),
		status: 200,
		statusText: 'OK',
		json: () => Promise.resolve(body)
	};
}

function getRawContentProxy (path) {
	const repo = path[3];
	const project = path[4];
	const sha = path[5];
	// return require ('./one.geojson');
	return require(`./${repo}--${project}--${sha}--${mapFilename}`);
}

function getAuthProxy (path) {

}

function getOrgsProxy (path) {
	// `https://api.github.com/orgs/${ githubOrgName }/repos
	const orgName = path[4];
	const method = path[5];
	if (orgName !== 'open-redist') {
		throw new Error('Proxies only exist for open-redist org');
	}

	switch (method) {
		case 'repos':
			return require('./orgs-repos.json');
		default:
			throw new Error(`No stub for 'orgs' method ${method}`);
	}
}

function getReactionsProxy (path) {

}

function getReposProxy (path) {
	// `https://api.github.com/repos/${ githubOrgName }/${ projectId }/issues/comments/${ commentId }/reactions` :
	const orgName = path[4];
	const projectId = path[5];
	const commentId = path[8];

	// TODO: not sure how best to mock this, could use nock.js
	// or manually build one of the body object types listed here:
	// https://developer.mozilla.org/en-US/docs/Web/API/Response/Response
	// (probably FormData?), or can i just pass a raw obj?
	const body = {

	};
	return body;
}

function getUserProxy (path) {

}
