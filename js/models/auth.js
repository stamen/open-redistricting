export default {

	// TODO: move to appConfig.json
	config: {
		githubAPIClientId: 'c2f002feaae356a50b34',
		redirectURL: 'http://localhost:8080/auth-flow/oauth',
		gatekeeperAccessTokenURL: 'https://open-redistricting-auth.herokuapp.com/authenticate/',
		tokenName: 'github-auth'
	},

	/**
	 * Kick off the OAuth dance.
	 * @param  {String|Boolean} landingPath pathname to which to redirect on completion of OAuth dance.
	 *                          If `true` is passed, will redirect to the current pathname.
	 *                          Defaults to '/'.
	 *                          Note that redirection is ultimately up to implementation code, not auth.js;
	 *                          this path is simply passed through all the redirects.
	 */
	authorize (landingPath='/') {

		if (landingPath === true) landingPath = window.location.pathname;

		let authUrl = 'https://github.com/login/oauth/authorize?client_id=' + this.config.githubAPIClientId + '&redirect_uri=' + this.config.redirectURL;
		if (landingPath) authUrl += '&state=' + landingPath;

		window.location = authUrl;

	},

	// TODO: refactor to use Promises
	fetchAccessToken (code, onSuccess, onError) {
		if (!code) {
			code = window.location.href.match(/code=([^&]*)/);
			if (!code || code.length < 1) {
				onError && onError();
			}
			code = code[1];
		}

		fetch(this.config.gatekeeperAccessTokenURL + code)
		.then(rsp => {
			return rsp.json().then(j => {
				this.setToken(j.token);
				onSuccess && onSuccess(this.getToken());
			});
		});

	},

	getToken () {
		return window.sessionStorage[this.config.tokenName];
	},

	setToken (val) {
		// use session storage rather than local, to avoid problems with stale access tokens.
		// auth as necessary to get a token if it is not stored in the session --
		// the auth redirects will be mostly transparent to the user.
		window.sessionStorage[this.config.tokenName] = val;
	},

	clearToken () {
		delete window.sessionStorage[this.config.tokenName];
	},

	loggedIn () {
		return !!this.getToken();
	},

	logout (cb) {
		this.clearToken();
		if (cb) cb()
	}

};
