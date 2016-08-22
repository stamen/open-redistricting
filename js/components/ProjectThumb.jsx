import React, { PropTypes } from 'react';

const ProjectThumb = ({ id, name }) => {
	
	return <div className='project-thumb'>{ name }</div>;

};

ProjectThumb.propTypes = {
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired
};

export default ProjectThumb;