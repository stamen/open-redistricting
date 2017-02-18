import React from 'react';
import { GeoJSON } from 'react-leaflet';

export default class GeoJsonUpdatable extends GeoJSON {

    constructor (props) {
        super(props);
    }

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
