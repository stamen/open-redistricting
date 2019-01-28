import PropTypes from 'prop-types';
import React from 'react';
import {Map, TileLayer} from 'react-leaflet';
import leaflet from 'leaflet';

import appConfig from '../../static/appConfig.json';

class GeoJsonMap extends React.Component {

	state = {
		geoJson: null,
		loadError: null
	};

	geojsonLoadState = null;

	// HACK to avoid setState on unmounted component
	isMounted = false;

	static propTypes = {
		path: PropTypes.string.isRequired,
		fetchJSON: PropTypes.func.isRequired,
		mapOptions: PropTypes.object
	}

	componentDidMount () {

		this.fetchGeoJson(this.props.path);
		this.isMounted = true;

	}

	UNSAFE_componentWillReceiveProps (nextProps) {

		// once loaded, update on a path change.
		if (this.geojsonLoadState === 'loaded') {
			if (this.props.path !== nextProps.path) {
				this.fetchGeoJson(nextProps.path);
			}
		}

	}

	componentWillUnmount () {

		this.isMounted = false;
	}

	fetchGeoJson (path) {

		// TODO: move effectful fetchGeoJson logic to reducers
		// to avoid Promise resolution on unmounted component
		this.props.fetchJSON(path)
		.then(

			response => {
				if (this.isMounted) {
					this.geojsonLoadState = null;				
					this.setState({
						geoJson: response
					});
				}
			},

			error => {
				if (this.isMounted) {
					this.setState({
						loadError: `Could not fetch/read GeoJSON from ${ path }`
					});
				}
			}

		);

	}

	componentDidUpdate () {

		const layerClassName = 'geojson-layer';

		let map = this.leafletMap && this.leafletMap.leafletElement;
		if (map && this.state.geoJson && !this.geojsonLoadState) {

			this.geojsonLoadState = 'loading';

			// remove any existing layers
			map.eachLayer(layer => {
				if (layer.options.className === layerClassName) map.removeLayer(layer);
			});

			// fit bounds of loaded features
			let numFeatures = this.state.geoJson.features.length,
				numFeaturesLoaded = 0,
				geojsonLayer = L.geoJson(null, {
					onEachFeature: (feature, layer) => {

						if (++numFeaturesLoaded >= numFeatures) {
							let bounds = geojsonLayer.getBounds();
							if (bounds.isValid()) {
								map.fitBounds(bounds, {
									animate: false,
									padding: [20, 20]
								});
							}
							this.geojsonLoadState = 'loaded';
						}

					},
					className: layerClassName
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
				zoomSnap: 0,
				zoomControl: false,
				attributionControl: false,
				keyboard: false,
				dragging: false,
				touchZoom: false,
				scrollWheelZoom: false,
				doubleClickZoom: false,
				boxZoom: false,
				...(this.props.mapOptions || {})
			};

			body = (
				<Map
					{ ...mapConfig }
					ref={ref => this.leafletMap = ref}
					className='map-container'
				>
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
