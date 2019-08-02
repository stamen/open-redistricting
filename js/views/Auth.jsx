import React from 'react';

import AppContext from '../context';
import auth from '../models/auth';


class Auth extends React.Component {
	static contextType = AppContext;

	// HACK to avoid setState on unmounted component
	isMounted = false;

	componentDidMount () {

		this.isMounted = true;

		// Extracted from query string in checkForInboundAuth
		const oAuthState = this.props.location && this.props.location.state;
		const { code, state } = oAuthState || {};
		let pathname = '/';

		if (state) {
			// Check for state passed from auth.js via App.jsx.
			// Technically, this is an incorrect use of OAuth2 state,
			// which is supposed to be used for additional security.
			// But it's also handy for maintaining state across redirects;
			// we use it here to redirect the user to the
			// page that initially requested the auth.
			pathname = decodeURIComponent(state);
		}

		// TODO: move effectful fetchAccessToken logic to reducers
		// to avoid Promise resolution on unmounted component
		auth.fetchAccessToken(code,
			() => {
				if (this.isMounted) {
					// on success
					this.props.history.push({
						pathname
					});
				}
			},
			() => {
				if (this.isMounted) {
					// on error
					this.props.history.push({
						pathname: '/',
						state: { errorResponse: window.location.href }
					});
				}
			}
		);

	}

	componentWillUnmount () {

		this.isMounted = false;

	}

	render () {

		return (
			<div className='auth-page'>
				<h1>Logging in...</h1>
			</div>
		);

	}

}

export default Auth;
