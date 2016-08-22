import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const ProposalThumb = ({ project, number, title }) => {

	let link = `/${ project.owner.login }/${ project.name }/${ number }`;
	
	return (
		<Link to={ link }>
			<figure className='proposal-thumb'>
				<div className='map'></div>
				<figcaption>{ title }</figcaption>
			</figure>
		</Link>
	);

};

ProposalThumb.propTypes = {
	number: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	project: PropTypes.shape({
		owner: PropTypes.shape({
			login: PropTypes.string
		}),
		name: PropTypes.string
	}).isRequired
};

export default ProposalThumb;