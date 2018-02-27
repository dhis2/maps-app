import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Paper from 'material-ui/Paper';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { changeOrgUnitCoordinate, stopRelocateOrgUnit} from '../../actions/orgUnits';

const styles = {
    paper: {
        position: 'absolute',
        top: 96,
        right: 48,
        width: 150,
        padding: 8,
        zIndex: 1100,
    },
    close: {
        width: 16,
        height: 16,
        float: 'right',
        cursor: 'pointer',
    }
};


class RelocateDialog extends Component {

    static contextTypes = {
        map: PropTypes.object
    };

    componentDidUpdate() {
        const feature = this.props.feature;
        const map = this.context.map;
        const mapContainer = map.getContainer();

        if (feature) {
            map.on('click', this.onMapClick, this);
            mapContainer.style.cursor = 'crosshair';
        } else {
            map.off('click', this.onMapClick, this);
            mapContainer.style.cursor = 'auto';
            mapContainer.style.cursor = '-webkit-grab';
            mapContainer.style.cursor = '-moz-grab';
        }
    }

    onMapClick(evt) {
        const { layerId, feature, changeOrgUnitCoordinate, stopRelocateOrgUnit } = this.props;
        const latlng = evt.latlng;
        const coordinate = [parseFloat(latlng.lng.toFixed(6)), parseFloat(latlng.lat.toFixed(6))];

        changeOrgUnitCoordinate(layerId, feature.id, coordinate);
        stopRelocateOrgUnit();
    }

    render() {
        const { feature, stopRelocateOrgUnit } = this.props;

        if (!feature) {
            return null;
        }

        return (
            <Paper style={styles.paper}>
                <span onClick={stopRelocateOrgUnit}>
                    <SvgIcon
                        icon='Cancel'
                        style={styles.close}
                    />
                </span>
                {i18next.t('Click the map where you want to relocate facility')} <strong>{feature.properties.name}</strong>
            </Paper>
        );

    }


};





export default connect(
    state => ({
        ...state.relocate
    }),
    { changeOrgUnitCoordinate, stopRelocateOrgUnit, }
)(RelocateDialog);

