import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Paper } from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import {
    changeOrgUnitCoordinate,
    stopRelocateOrgUnit,
} from '../../actions/orgUnits';

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
    },
};

class RelocateDialog extends Component {
    static propTypes = {
        map: PropTypes.object,
        feature: PropTypes.object,
        layerId: PropTypes.string,
        changeOrgUnitCoordinate: PropTypes.func.isRequired,
        stopRelocateOrgUnit: PropTypes.func.isRequired,
    };

    componentDidUpdate() {
        if (this.props.feature) {
            this.startRelocate();
        } else {
            this.stopRelocate();
        }
    }

    startRelocate = () => {
        const { map } = this.props;

        if (map) {
            const mapgl = map.getMapGL();
            const container = map
                .getContainer()
                .getElementsByClassName('mapboxgl-interactive')[0];

            container.style.cursor = 'crosshair';
            mapgl.on('click', this.onMapClick);
        }
    };

    stopRelocate = () => {
        const { map, stopRelocateOrgUnit } = this.props;

        if (map) {
            const mapgl = map.getMapGL();
            const container = map
                .getContainer()
                .getElementsByClassName('mapboxgl-interactive')[0];

            container.style.cursor = '';
            mapgl.off('click', this.onMapClick);
        }

        stopRelocateOrgUnit();
    };

    onMapClick = evt => {
        const { layerId, feature, changeOrgUnitCoordinate } = this.props;
        const { lng, lat } = evt.lngLat;
        const coordinate = [lng, lat];

        changeOrgUnitCoordinate(layerId, feature.properties.id, coordinate);

        this.stopRelocate();
    };

    render() {
        const { feature } = this.props;

        if (!feature) {
            return null;
        }

        return (
            <Paper style={styles.paper}>
                <span onClick={this.stopRelocate}>
                    <CancelIcon style={styles.close} />
                </span>
                {i18n.t('Click the map where you want to relocate facility')}{' '}
                <strong>{feature.properties.name}</strong>
            </Paper>
        );
    }
}

export default connect(
    state => ({
        ...state.relocate,
    }),
    { changeOrgUnitCoordinate, stopRelocateOrgUnit }
)(RelocateDialog);
