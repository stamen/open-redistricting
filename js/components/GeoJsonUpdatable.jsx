import React from 'react';
import { GeoJson }  from 'react-leaflet';

export default class GeoJsonUpdatable extends GeoJson {

    static propTypes = {
        data: React.PropTypes.object.isRequired
    }

    componentWillReceiveProps (prevProps) {
        if (prevProps.data !== this.props.data) {
            this.leafletElement.clearLayers();
        }
    }

    componentDidUpdate (prevProps) {
        if (prevProps.data !== this.props.data) {
            this.leafletElement.addData(this.props.data);
        }
    }
}

