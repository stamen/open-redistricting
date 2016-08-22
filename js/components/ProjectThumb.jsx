import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const ProjectThumb = ({ name, owner }) => {

	let link = `/${ owner.login }/${ name }`;
	
	return (
		<Link to={ link }>
			<figure className='project-thumb'>
				<div className='map'></div>
				<figcaption>{ name }</figcaption>
			</figure>
		</Link>
	);

};

ProjectThumb.propTypes = {
	name: PropTypes.string.isRequired,
	owner: PropTypes.shape({
		login: PropTypes.string
	}).isRequired
};

export default ProjectThumb;