import { connect } from 'react-redux'; // TODO: not available in plugin
import Layer from './Layer';
import { filterData } from '../../../util/filter';
import { setFeatureProfile } from '../../../actions/feature'; // TODO: not available in plugin
import { GEOJSON_LAYER } from '../../../constants/layers';

class FeatureService extends Layer {
    createLayer() {
        const {
            id,
            index,
            opacity,
            isVisible,
            data,
            dataFilters,
            feature,
            /* config,*/
        } = this.props;
        const { map } = this.context;

        const filteredData = filterData(data, dataFilters);

        const group = map.createLayer({
            type: 'group',
            id,
            index,
            opacity,
            isVisible,
        });

        group.addLayer({
            type: GEOJSON_LAYER,
            id,
            index,
            opacity,
            isVisible,
            data: [feature],
            // hoverLabel: '{name}',
            style: {
                color: 'transparent',
                strokeColor: '#333',
            },
            // onClick: this.onFeatureClick.bind(this),
            // onRightClick: this.onFeatureRightClick.bind(this),
        });

        group.addLayer({
            type: GEOJSON_LAYER,
            id,
            index,
            opacity,
            isVisible,
            data: filteredData,
            // hoverLabel: '{name}',
            style: {
                color: 'red',
                // strokeColor: organisationUnitColor,
            },
            onClick: this.onFeatureClick.bind(this),
            // onRightClick: this.onFeatureRightClick.bind(this),
        });

        this.layer = group;

        // map.addLayer(this.layer);

        /*
        this.layer = map.createLayer({
            id,
            index,
            opacity,
            isVisible,
            ...config,
        });
        */

        map.addLayer(this.layer);

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce();
    }

    onFeatureClick(evt) {
        const { name, fields } = this.props;

        this.props.setFeatureProfile({
            name,
            fields,
            data: evt.feature.properties,
        });
    }
}

export default connect(null, {
    setFeatureProfile,
})(FeatureService);
