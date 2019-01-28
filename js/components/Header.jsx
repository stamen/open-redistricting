import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import auth from '../models/auth';

class Header extends React.Component {
    static propTypes = {
		//
	}

    login = () => {

		auth.authorize(this.props.location.pathname, [ 'public_repo' ]);

	};

    logout = () => {

		auth.logout(() => {
			// hard refresh/redirect to app root
			window.location = window.location.origin + window.location.pathname;
		});

	};

    render () {

		return (
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

	}
}

export default Header;
