import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import MenuItem from 'material-ui/MenuItem';
import { SvgIcon } from '@dhis2/d2-ui-core';
import FileSaver from 'file-saver'; // https://github.com/eligrey/FileSaver.js
import { createSld } from '../../../util/sld';

const styles = {
    icon: {
        margin: 4,
    },
    menuItem: {
        lineHeight: '32px',
        minHeight: 32,
        fontSize: 14,
    },
};

// TODO: Use layer name rather than id as file name
const downloadGeoJson = ({ id, data }) => {
    const geojson = {
        type: 'FeatureCollection',
        features: data,
    };

    const blob = new Blob([JSON.stringify(geojson)], {
        type: 'application/json;charset=utf-8',
    });

    FileSaver.saveAs(blob, id + '.geojson');
};

const downloadStyle = id => {
    const sld = createSld(); // TODO: Make generic
    const blob = new Blob([sld], { type: 'application/xml;charset=utf-8' });

    FileSaver.saveAs(blob, id + '.sld');
};

const DownloadMenu = ({ id, data }) => (
    <MenuItem
        primaryText={`${i18n.t('Download')} ...`}
        rightIcon={<SvgIcon icon="ArrowDropRight" style={styles.icon} />}
        menuItems={[
            <MenuItem
                key="geojson"
                primaryText={i18n.t('Organisation units (GeoJSON)')}
                onClick={() => downloadGeoJson(id, data)}
                style={styles.menuItem}
            />,
            <MenuItem
                key="sld"
                primaryText={i18n.t('Style (SLD)')}
                onClick={() => downloadStyle(id)}
                style={styles.menuItem}
            />,
        ]}
        style={styles.menuItem}
    />
);

DownloadMenu.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.array,
};

export default DownloadMenu;
