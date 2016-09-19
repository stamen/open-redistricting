import React, { PropTypes } from 'react';
import { Link, withRouter } from 'react-router'

import auth from '../models/auth';

class Header extends React.Component {

	static propTypes = {
		//
	}

	constructor (props) {

		super(props);

		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);

	}

	login () {

		auth.authorize(this.props.location.pathname, [ 'public_repo' ]);

	}

	logout () {

		auth.logout(() => {
			// hard refresh/redirect to app root
			window.location = window.location.origin + window.location.pathname;
		});

	}

	render () {

		let out = (
			<div id='header'>
				<h1><Link to='/'>Open Redistricting</Link></h1>
				<div className='login-options'>
					{ auth.loggedIn() ? 
						<div onClick={ this.logout }>Log out</div> :
						<div onClick={ this.login }>Log in / Sign up</div>
					}
				</div>
			</div>
		);

		return out;

	}

}

export default withRouter(Header);
