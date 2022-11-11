import Layer from './Layer';
import { GEOJSON_LAYER } from '../../../constants/layers';

export default class ExternalLayer extends Layer {
    createLayer() {
        const {
            id,
            index,
            opacity,
            isVisible,
            data,
            feature,
            /* config,*/
        } = this.props;
        const { map } = this.context;

        // console.log('FeatureService', feature);

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
            data,
            // hoverLabel: '{name}',
            style: {
                color: 'red',
                // strokeColor: organisationUnitColor,
            },
            // onClick: this.onFeatureClick.bind(this),
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
}
