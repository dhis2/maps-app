import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import Button from 'd2-ui/lib/button/Button';
import { changeOrgUnitCoordinate, stopRelocateOrgUnit} from '../../actions/orgUnits';

const style = {
    position: 'absolute',
    top: 96,
    right: 8,
    width: 150,
    padding: 8,
    zIndex: 1100,
};

const RelocateDialog = (props, context) => {
    const feature = props.feature;
    const map = context.map;
    const mapContainer = map.getContainer();

    const onMapClick = evt => {
        const latlng = evt.latlng;
        const coordinate = [latlng.lng.toFixed(6), latlng.lat.toFixed(6)];

        props.changeOrgUnitCoordinate(props.layerId, feature.id, coordinate);
        props.stopRelocateOrgUnit();
    };

    if (feature) {
        mapContainer.style.cursor = 'crosshair';
        map.on('click', onMapClick);

        return (
            <Paper style={style}>
                Click the map where you want to relocate facility <strong>{props.feature.properties.name}</strong>
                <Button onClick={props.stopRelocateOrgUnit}>Cancel</Button>
            </Paper>
        );
    } else {
        map.off('click', onMapClick);

        mapContainer.style.cursor = 'auto';
        mapContainer.style.cursor = '-webkit-grab';
        mapContainer.style.cursor = '-moz-grab';
    }

    return null;
};

RelocateDialog.contextTypes = {
    map: PropTypes.object
};


export default connect(
    state => ({
        ...state.relocate
    }),
    { changeOrgUnitCoordinate, stopRelocateOrgUnit, }
)(RelocateDialog);

