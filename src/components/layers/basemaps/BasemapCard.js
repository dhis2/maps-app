import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import LayerCard from '../LayerCard';
import BasemapList from './BasemapList';
import {
    changeBasemapOpacity,
    toggleBasemapExpand,
    toggleBasemapVisibility,
    selectBasemap,
} from '../../../actions/basemap';
import { BASEMAP_TYPE_VECTOR_STYLE } from '../../../constants/basemaps';

// Basemap card shown in left layers panel
const BasemapCard = props => {
    const {
        name,
        subtitle = i18n.t('Basemap'),
        opacity,
        isExpanded,
        isVisible,
        toggleBasemapExpand,
        toggleBasemapVisibility,
        changeBasemapOpacity,
    } = props;

    const hasOpacity =
        props.config.type === BASEMAP_TYPE_VECTOR_STYLE ? false : true;

    return (
        <LayerCard
            hasOpacity={hasOpacity}
            title={name}
            subtitle={subtitle}
            opacity={opacity}
            isExpanded={isExpanded}
            isVisible={isVisible}
            onOpacityChange={changeBasemapOpacity}
            toggleExpand={toggleBasemapExpand}
            toggleLayerVisibility={toggleBasemapVisibility}
        >
            <BasemapList
                selectedID={props.basemap.id}
                basemaps={props.basemaps}
                selectBasemap={props.selectBasemap}
            />
        </LayerCard>
    );
};

BasemapCard.propTypes = {
    config: PropTypes.object,
    name: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    opacity: PropTypes.number,
    isVisible: PropTypes.bool,
    isExpanded: PropTypes.bool,

    basemap: PropTypes.object.isRequired,
    basemaps: PropTypes.array.isRequired,

    changeBasemapOpacity: PropTypes.func.isRequired,
    toggleBasemapExpand: PropTypes.func.isRequired,
    toggleBasemapVisibility: PropTypes.func.isRequired,
    selectBasemap: PropTypes.func.isRequired,
};

BasemapCard.defaultProps = {
    config: {},
    opacity: 1,
    isVisible: true,
    isExpanded: true,
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
