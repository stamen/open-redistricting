import React, { PropTypes } from 'react';
import {
	Map,
	GeoJson,
	TileLayer
} from 'react-leaflet';
import leaflet from 'leaflet';

import appConfig from '../../static/appConfig.json';

class GeoJsonMap extends React.Component {

	constructor (props) {

		super(props);
		this.state = {};
		this.onMapLayerAdd = this.onMapLayerAdd.bind(this);

	}

	static propTypes = {
		path: PropTypes.string.isRequired,
		fetchJSON: PropTypes.func.isRequired
	}

	componentWillMount () {

		let { path } = this.props;

		this.props.fetchJSON(path)
		.then(

			response => {
				
				this.setState({
					geoJson: response
				});
			},

			error => {
				this.setState({
					loadError: `Could not fetch/read GeoJSON from ${ path }`
				});
			}

		);

	}

	render () {

		let body = '';

		if (this.state.geoJson) {

			let mapConfig = {
				zoom: 8,
				center: [0, 0],
				zoomSnap: 0.0,
				zoomControl: false,
				attributionControl: false,
				keyboard: false,
				dragging: false,
				touchZoom: false,
				scrollWheelZoom: false,
				doubleClickZoom: false,
				boxZoom: false
			};

			body = (
				<Map { ...mapConfig } ref='leafletMap' className='map-container' onLayeradd={ this.onMapLayerAdd }>
					{ this.renderTileLayers() }
					<GeoJson className='geojson-layer' data={ this.state.geoJson } />
				</Map>
			);

		} else if (this.state.loadError) {

			body = (
				<div className='load-error'>
					{ this.state.loadError }
				</div>
			);

		}

		return (
			<div className='geojson-map'>
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
			this.refs.leafletMap.leafletElement.fitBounds(
				event.layer.getBounds(),
				{
					animate: false,
					padding: [20, 20]
				}
			);
		}

	}

}

export default GeoJsonMap;
