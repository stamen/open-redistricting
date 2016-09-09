import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import GeoJsonMap from './GeoJsonMap.jsx';

const ProjectThumb = ({
	name,
	description,
	owner,
	mapPath,
	fetchJSON
}) => {

	let link = `/${ owner.login }/${ name }`;
	
	return (
		<Link to={ link }>
			<figure className='project-thumb'>
				<GeoJsonMap
					path={ mapPath }
					fetchJSON={ fetchJSON }
				/>
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
	}).isRequired,
	mapPath: PropTypes.string.isRequired,
	fetchJSON: PropTypes.func.isRequired
};

export default ProjectThumb;