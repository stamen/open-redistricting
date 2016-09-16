import React, { PropTypes } from 'react';

const Revision = ({
	sha,
	desc,
	date }) => {

	return (
		<div className='revision'>
			<div className='date'>{ date }</div>
			<div className='desc'>{ desc }</div>
		</div>
	);
};

Revision.propTypes = {
	sha: PropTypes.string.isRequired,
	desc: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	onFork: PropTypes.func
};

Revision.defaultProps = {
	onFork: (sha) => {}
}

export default Revision;
