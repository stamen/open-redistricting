import React, { PropTypes } from 'react';

const Comment = ({
	id,
	body,
	authorName,
	date,
	upvotes,
	downvotes,
	canVote,
	onVote }) => {

	return (
		<div className='comment'>
			<h4>{ authorName }</h4>
			<div className='created-date'>{ date }</div>
			<p>{ body }</p>
			<div className={ `up votes${ canVote ? ' active' : '' }` }>
				<i className='em em---1' onClick={ () => onVote(id, 1) }></i>{ upvotes }
			</div>
			<div className={ `down votes${ canVote ? ' active' : '' }` }>
				<i className='em em--1' onClick={ () => onVote(id, -1) }></i>{ downvotes }
			</div>
		</div>
	);
};

Comment.propTypes = {
	id: PropTypes.string.isRequired,
	body: PropTypes.string.isRequired,
	authorName: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	upvotes: PropTypes.number,
	downvotes: PropTypes.number,
	canVote: PropTypes.bool,
	onVote: PropTypes.func
};

Comment.defaultProps = {
	onVote: (id, val) => {}
}

export default Comment;
