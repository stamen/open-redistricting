import React, { PropTypes } from 'react';
import { Link } from 'react-router'

import auth from '../models/auth';

class Header extends React.Component {

	static propTypes = {
		//
	}

	login () {

		auth.authorize(true);

	}

	logout () {

		auth.logout(() => {
			this.props.history.push({
				pathname: '/'
			});
		});

	}

	render () {

		return (
			<div id='header'>
				<h1><Link to='/'>Open Redistricting</Link></h1>
				<div className='login-options'>
					{ auth.loggedIn() ? 
						<div onClick={ this.logout }>Log out</div> :
						<div onClick={ this.login }>Login / Signup</div>
					}
				</div>
			</div>
		);

	}

}

export default Header;
