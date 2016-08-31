import React, { PropTypes } from 'react';
import {
	Map,
	GeoJson,
	TileLayer
} from 'react-leaflet';
import leaflet from 'leaflet';

// JSTS doesn't bundle properly....why not?
// import jsts from 'jsts';

import appConfig from '../../static/appConfig.json';

class DiffMap extends React.Component {

	constructor (props) {

		super(props);
		this.state = {};
		this.onMapLayerAdd = this.onMapLayerAdd.bind(this);

	}

	static propTypes = {
		path1: PropTypes.string.isRequired,
		path2: PropTypes.string.isRequired,
		fetchJSON: PropTypes.func.isRequired
	}

	componentWillMount () {

		let jsts = require('jsts'),
			{ path1, path2 } = this.props;

		Promise.all([
			this.props.fetchJSON(path1),
			this.props.fetchJSON(path2)
		])
		.then(

			responses => {
				
				let reader = new jsts.io.GeoJSONReader(),
					p1 = reader.read(responses[0]),
					p2 = reader.read(responses[1]);

				try {

					p1 = p1.features.reduce((acc, f, i) => {
						if (i === 0) return f.geometry;
						if (acc.geometries) return acc.union(f.geometry);
						return acc.geometry.union(f.geometry);
					});

					p2 = p2.features.reduce((acc, f, i) => {
						if (i === 0) return f.geometry;
						if (acc.geometries) return acc.union(f.geometry);
						return acc.geometry.union(f.geometry);
					});

				} catch (error) {
					this.setState({
						diffError: `Could not parse GeoJSON from ${ path1 } and ${ path2 }`
					});
				}

				let diff = {
						type: 'Feature',
						properties: {},
						geometry: new jsts.io.GeoJSONWriter().write(p1.symDifference(p2))
					},
					intersection = {
						type: 'Feature',
						properties: {},
						geometry: new jsts.io.GeoJSONWriter().write(p1.intersection(p2))
					};
				this.setState({
					diff,
					intersection
				});
			},

			error => {
				this.setState({
					diffError: `Could not fetch/read GeoJSON from ${ path1 } and ${ path2 }`
				});
			}

		);

	}

	render () {

		let body = '';

		if (this.state.diff) {

			let mapConfig = {
				zoom: 8,
				center: [0, 0],
			};

			body = (
				<Map { ...mapConfig } ref='leafletMap' className='map-container' onLayeradd={ this.onMapLayerAdd }>
					{ this.renderTileLayers() }
					<GeoJson className='diff' data={ this.state.diff } />
					<GeoJson className='intersection' data={ this.state.intersection } />
				</Map>
			);

		} else if (this.state.diffError) {

			body = (
				<div className='diff-error'>
					{ this.state.diffError }
				</div>
			);

		}

		return (
			<div className='diff-map'>
				{ body }
			</div>
		);

	}

	renderTileLayers () {

		let layers = [];

		if (appConfig.map.tileLayers) {
			layers = layers.concat(appConfig.map.tileLayers.map((item, i) => {
				return (
					<TileLayer
						key={ 'tile-layer-' + i }
						url={ item.url }
					/>
				);
			}));
		}

		return layers;

	}

	onMapLayerAdd (event) {

		if (event.layer.feature) {
			// fit map bounds to GeoJSON layer once it loads
			// TODO: this fires for each GeoJson layer. how can i distinguish the diff from the intersection?
			// TODO: really should be fitting bounds to the union, actually...
			//		 or just manually adding diff + intersection bounds together and using the resulting bounds rect
			this.refs.leafletMap.leafletElement.fitBounds(event.layer.getBounds());
		}

	}

}

export default DiffMap;
