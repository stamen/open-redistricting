import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const ProjectThumb = ({ id, name }) => {

	let link = `/projects/${ id }`;
	
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
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired
};

export default ProjectThumb;