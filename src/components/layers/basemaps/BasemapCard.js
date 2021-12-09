import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui';
import LayerCard from '../LayerCard';
import BasemapList from './BasemapList';
import useBasemapConfig from '../../../hooks/useBasemapConfig';
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

    const basemap = useBasemapConfig(props.basemap, props.basemaps);

    return (
        <>
            {basemap.id === undefined ? (
                <>
                    <ComponentCover translucent>
                        <CenteredContent>
                            <CircularLoader />
                        </CenteredContent>
                    </ComponentCover>
                    <div />
                </>
            ) : (
                <LayerCard
                    hasOpacity={
                        basemap.config.type === VECTOR_STYLE ? false : true
                    }
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
            )}
        </>
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
