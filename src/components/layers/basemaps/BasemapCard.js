import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Layer, CenteredContent, CircularLoader } from '@dhis2/ui';
import LayerCard from '../LayerCard';
import BasemapList from './BasemapList';
import { useSystemSettings } from '../../../hooks/SystemSettingsProvider';
import {
    changeBasemapOpacity,
    toggleBasemapExpand,
    toggleBasemapVisibility,
    selectBasemap,
} from '../../../actions/basemap';
import { VECTOR_STYLE } from '../../../constants/layers';

// Basemap card shown in left layers panel
const BasemapCard = props => {
    const {
        subtitle = i18n.t('Basemap'),
        toggleBasemapExpand,
        toggleBasemapVisibility,
        changeBasemapOpacity,
    } = props;
    const [basemap, setBasemap] = useState({});
    const { systemSettings } = useSystemSettings();

    useEffect(() => {
        const mybasemap = Object.assign(
            {},
            { id: systemSettings.keyDefaultBaseMap },
            props.basemap
        );

        const thebasemap = props.basemaps.find(({ id }) => id === mybasemap.id);
        setBasemap(Object.assign({}, thebasemap, mybasemap));
    }, [systemSettings.keyDefaultBaseMap, props.basemap, props.basemaps]);

    if (!basemap.id) {
        return null;
    }

    return (
        <LayerCard
            hasOpacity={basemap.config.type === VECTOR_STYLE ? false : true}
            title={basemap.name}
            subtitle={subtitle}
            opacity={basemap.opacity}
            isExpanded={basemap.isExpanded}
            isVisible={basemap.isVisible}
            onOpacityChange={changeBasemapOpacity}
            toggleExpand={toggleBasemapExpand}
            toggleLayerVisibility={toggleBasemapVisibility}
        >
            <BasemapList
                selectedID={basemap.id}
                basemaps={props.basemaps}
                selectBasemap={props.selectBasemap}
            />
        </LayerCard>
    );
};

BasemapCard.propTypes = {
    subtitle: PropTypes.string,
    basemap: PropTypes.object.isRequired,
    basemaps: PropTypes.array.isRequired,
    changeBasemapOpacity: PropTypes.func.isRequired,
    toggleBasemapExpand: PropTypes.func.isRequired,
    toggleBasemapVisibility: PropTypes.func.isRequired,
    selectBasemap: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        basemap: state.map.basemap, // Selected basemap
        basemaps: state.basemaps, // All basemaps
    }),
    {
        changeBasemapOpacity,
        toggleBasemapExpand,
        toggleBasemapVisibility,
        selectBasemap,
    }
)(BasemapCard);
