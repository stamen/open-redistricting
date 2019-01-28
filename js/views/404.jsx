import React from 'react';
import { Link } from 'react-router-dom';

const FourOhFour = ({ match }) => {
	const { url } = match;
	return (
		<div>
			<h1>Oops. Try going <Link to='/'>somewhere else</Link>.</h1>
			<h3>(There's nothing at `{ url }`)</h3>
		</div>
	);
};

export default FourOhFour;
