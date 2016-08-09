import React from 'react';
import { Link } from 'react-router';

export default class FourOhFour extends React.Component {

	constructor (props) {

		super(props);

		console.warn("404 at route:", props.route);

	}

	render () {
		return (
			<div>
				<h1>Oops. Try going <Link to='/'>somewhere else</Link>.</h1>
				<h3>(There's nothing at route path `{ this.props.route.path }`)</h3>
			</div>
		);
	}
};
