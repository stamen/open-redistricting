import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import GeoJsonMap from './GeoJsonMap.jsx';

const ProposalThumb = ({
	projectMetadata,
	projectMapPath,
	number,
	title,
	geoJsonPath,
	fetchJSON
}) => {

	let link = `/${ projectMetadata.owner.login }/${ projectMetadata.name }/${ number }`;
	
	return (
		<Link to={ link }>
			<figure className='proposal-thumb'>
				<GeoJsonMap
					path={ projectMapPath }
					fetchJSON={ fetchJSON }
				/>
				<figcaption>{ title }</figcaption>
			</figure>
		</Link>
	);

};

ProposalThumb.propTypes = {
	number: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	projectMetadata: PropTypes.shape({
		owner: PropTypes.shape({
			login: PropTypes.string
		}),
		name: PropTypes.string
	}).isRequired,
	projectMapPath: PropTypes.string.isRequired,
	fetchJSON: PropTypes.func.isRequired
};

export default ProposalThumb;