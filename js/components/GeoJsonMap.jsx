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

	componentDidUpdate () {

		let map = this.refs.leafletMap && this.refs.leafletMap.leafletElement;
		if (map && !this.geojsonLoadState) {

			this.geojsonLoadState = 'loading';

			let numFeatures = this.state.geoJson.features.length,
				numFeaturesLoaded = 0,
				geojsonLayer = L.geoJson(null, {
					onEachFeature: (feature, layer) => {

						if (++numFeaturesLoaded >= numFeatures) {
							map.fitBounds(geojsonLayer.getBounds(), {
								animate: false,
								padding: [20, 20]
							});
							this.geojsonLoadState = 'loaded';
						}

					},
					className: 'geojson-layer'
				}).addTo(map);

			// add geojson after setting up handlers to ensure layer is available
			geojsonLayer.addData(this.state.geoJson);

		}

	}

	render () {

		let body = '';

		if (this.state.geoJson) {

			let mapConfig = {
				zoom: 8,
				center: [0, 0],
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
				<Map { ...mapConfig } ref='leafletMap' className='map-container'>
					{ this.renderTileLayers() }
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

}

export default GeoJsonMap;
