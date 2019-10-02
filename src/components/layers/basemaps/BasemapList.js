import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
// import MapApi from '@dhis2/gis-api';
import MapApi from '@dhis2/maps-gl';
import Basemap from './Basemap';

const styles = {
    container: {
        maxHeight: 270,
        overflowY: 'auto',
        marginLeft: 7,
    },
};

const BasemapList = ({ classes, selectedID, basemaps, selectBasemap }) => (
    <div className={classes.container} data-test="basemaplist">
        {basemaps
            .filter(basemap => MapApi.hasLayerSupport(basemap.config.type))
            .map((basemap, index) => (
                <Basemap
                    key={`basemap-${index}`}
                    onClick={selectBasemap}
                    isSelected={basemap.id === selectedID}
                    {...basemap}
                />
            ))}
    </div>
);

BasemapList.propTypes = {
    classes: PropTypes.object.isRequired,
    selectedID: PropTypes.string.isRequired,
    basemaps: PropTypes.array.isRequired,
    selectBasemap: PropTypes.func.isRequired,
};

export default withStyles(styles)(BasemapList);
