import React, { PropTypes } from 'react';

const Comment = ({ body, authorName, date, upvotes, downvotes }) => {

	return (
		<div className='comment'>
			<h4>{ authorName }</h4><div>{ date }</div>
			<p>{ body }</p>
			<div className='upvotes'>+{ upvotes }</div>
			<div className='downvotes'>-{ downvotes }</div>
		</div>
	);
};

Comment.propTypes = {
	body: PropTypes.string.isRequired,
	authorName: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	upvotes: PropTypes.number,
	downvotes: PropTypes.number
};

export default Comment;
