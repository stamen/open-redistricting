import React, { PropTypes } from 'react';
import {
	Map,
	TileLayer
} from 'react-leaflet';
import leaflet from 'leaflet';

// JSTS doesn't bundle properly....why not?
// import jsts from 'jsts';

import appConfig from '../../static/appConfig.json';
import GeoJsonUpdatable from './GeoJsonUpdatable.jsx';

class DiffMap extends React.Component {

	constructor (props) {

		super(props);
		this.state = {};
		this.onMapLayerAdd = this.onMapLayerAdd.bind(this);

	}

	static propTypes = {
		path1: PropTypes.string.isRequired,
		path2: PropTypes.string.isRequired,
		fetchJSON: PropTypes.func.isRequired,
		mapOptions: PropTypes.object
	}

	componentWillMount () {

		this.calculateGeometry(this.props);

	}

	componentWillReceiveProps (nextProps) {

		// only recalculate geometry if we have a new path
		if (this.props.path1 !== nextProps.path1 || this.props.path2 !== nextProps.path2) {
			this.calculateGeometry(nextProps);
		}

	}

	shouldComponentUpdate (nextProps, nextState) {

		return this.state !== nextState;

	}

	calculateGeometry ({ path1, path2, fetchJSON }) {

		let jsts = require('jsts');

		Promise.all([
			fetchJSON(path1),
			fetchJSON(path2)
		])
		.then(

			responses => {
				
				let reader = new jsts.io.GeoJSONReader(),
					p1 = reader.read(responses[0]),
					p2 = reader.read(responses[1]),
					diff,
					intersection;

				try {

					// TODO: this unioning seems necessary to perform JSTS operations between the two GeoJSON objects,
					// but causes boundaries between features to be erased. Find a better solution.
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
					throw new Error(`Could not parse GeoJSON from ${ path1 } and ${ path2 }: ${ error.message }`);
				}

				try {

					// BUG: if one of the two GeoJSON objects has multiple features and the other has only one feature,
					// these operations will fail. How to work around / fix this?
					diff = {
						type: 'Feature',
						properties: {},
						geometry: new jsts.io.GeoJSONWriter().write(p1.symDifference(p2))
					};

					intersection = {
						type: 'Feature',
						properties: {},
						geometry: new jsts.io.GeoJSONWriter().write(p1.intersection(p2))
					};

				} catch (error) {
					throw new Error(`Could not calculate diff from ${ path1 } and ${ path2 }: ${ error.message }`);
				}

				this.setState({
					diffError: null,
					diff,
					intersection
				});
			},

			error => {
				throw new Error(`Could not fetch/read GeoJSON from ${ path1 } and ${ path2 }: ${ error.message }`);
			}

		)
		.catch(error => {

			this.setState({
				diffError: error.message
			});

		});

	}

	render () {

		let body = '';

		if (this.state.diff) {

			let mapConfig = {
				zoom: 8,
				center: [0, 0],
				...(this.props.mapOptions || {})
			};

			body = (
				<Map { ...mapConfig } ref='leafletMap' className='map-container' onLayeradd={ this.onMapLayerAdd }>
					{ this.renderTileLayers() }
					<GeoJsonUpdatable className='diff' data={ this.state.diff } />
					<GeoJsonUpdatable className='intersection' data={ this.state.intersection } />
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

			// TODO: really should be fitting bounds to the union, actually...
			//		 or just manually adding diff + intersection bounds together and using the resulting bounds rect
			if (event.layer._options && event.layer._options.className === 'intersection') {
				// fit map bounds to GeoJSON layer once it loads
				this.refs.leafletMap.leafletElement.fitBounds(event.layer.getBounds());
			}

		}

	}

}

export default DiffMap;
