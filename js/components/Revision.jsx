import PropTypes from 'prop-types';
import React from 'react';

const Revision = ({
	sha,
	desc,
	date,
	onView,
	onFork }) => {

	return (
		<div className='revision' onClick={ () => onView(sha) }>
			<div className='date'>{ date }</div>
			<div className='desc'>{ desc }</div>
		</div>
	);
};

Revision.propTypes = {
	sha: PropTypes.string.isRequired,
	desc: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	onView: PropTypes.func,
	onFork: PropTypes.func
};

Revision.defaultProps = {
	onView: (sha) => {},
	onFork: (sha) => {}
};

export default Revision;
