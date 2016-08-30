import React, { PropTypes } from 'react';
import jsts from 'jsts';

const DiffMap = ({ path1, path2 }) => {

	console.log("TODO: load JSON at `path1` and `path2` and diff with JSTS: `a.symDifference(b)`")
	console.log(path1);

	return (
		<div className='diff-map'>
		</div>
	);

};

DiffMap.propTypes = {
	path1: PropTypes.string.isRequired,
	path2: PropTypes.string.isRequired
};

export default DiffMap;
