// TODO: this Singleton is not server-safe.
// If you're planning to make your app render on the server,
// you need to refactor this to be a function that generates one object per session,
// and pass that object through to each consumer.
// If you're running clientside-only, then have at it.

export default {

	// these sample values should either be overridden inline
	// or passed into init().
	config: {
		githubAPIClientId: 'xxx',
		redirectURL: 'http://example.com/',
		gatekeeperAccessTokenURL: 'https://example-gatekeeper.herokuapp.com/authenticate/',
		tokenName: 'github-auth'
	},

	init (config) {

		this.config = { ...config };

	},

	/**
	 * Kick off the OAuth dance.
	 * @param  {String|Boolean} landingPath pathname to which to redirect on completion of OAuth dance.
	 *                          If `true` is passed, will redirect to the current pathname.
	 *                          Defaults to '/'.
	 *                          Note that redirection is ultimately up to implementation code, not auth.js;
	 *                          this path is simply passed through all the redirects.
	 */
	authorize (landingPath='/', scopes) {

		if (landingPath === true) landingPath = window.location.pathname;

		let authUrl = 'https://github.com/login/oauth/authorize?client_id=' + this.config.githubAPIClientId + '&redirect_uri=' + this.config.redirectURL;
		if (landingPath) authUrl += '&state=' + landingPath;
		if (scopes) authUrl += '&scope=' + scopes.join(' ');

		window.location = authUrl;

	},

	// TODO: refactor to use Promises
	fetchAccessToken (code, onSuccess, onError) {

		if (!code) {
			code = this.extractOAuthCode();
			if (!code) {
				onError && onError();
				return;
			}
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
		// Use session storage rather than local, to avoid problems with stale access tokens.
		// Also, using session storage syncs with per-session request cache used in transport.js.
		// 
		// Auth as necessary to get a token if it is not stored in the session --
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
		if (cb) cb();

	},
	
	extractOAuthCode () {

		let code = window.location.search.match(/code=([^&]*)/);
		if (!code || code.length <= 1) {
			return null;
		}
		return code[1];

	},

	extractOAuthState () {

		let state = window.location.search.match(/state=([^&]*)/);
		if (!state || state.length <= 1) {
			// technically, this is an incorrect use of OAuth2 state,
			// which is supposed to be used for additional security.
			// But it's also handy for maintaining state across redirects;
			// we use it here to redirect the user to the
			// page that initially requested the auth.
			return null;
		}
		return decodeURIComponent(state[1]);

    }

};
