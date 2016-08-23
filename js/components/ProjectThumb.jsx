import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const ProjectThumb = ({ name, description, owner }) => {

	let link = `/${ owner.login }/${ name }`;
	
	return (
		<Link to={ link }>
			<figure className='project-thumb'>
				<div className='map'></div>
				<figcaption>{ description }</figcaption>
			</figure>
		</Link>
	);

};

ProjectThumb.propTypes = {
	name: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	owner: PropTypes.shape({
		login: PropTypes.string
	}).isRequired
};

export default ProjectThumb;