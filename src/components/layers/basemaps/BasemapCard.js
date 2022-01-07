import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui';
import LayerCard from '../LayerCard';
import BasemapList from './BasemapList';
import {
    changeBasemapOpacity,
    toggleBasemapExpand,
    toggleBasemapVisibility,
    selectBasemap,
} from '../../../actions/basemap';
import { VECTOR_STYLE } from '../../../constants/layers';
import useBasemapConfig from '../../../hooks/useBasemapConfig';

const BasemapCard = props => {
    const {
        subtitle = i18n.t('Basemap'),
        toggleBasemapExpand,
        toggleBasemapVisibility,
        changeBasemapOpacity,
        selectBasemap,
    } = props;
    const basemap = useBasemapConfig(props.basemap);

    return (
        <>
            {basemap.id === undefined ? (
                <ComponentCover>
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                </ComponentCover>
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
                        selectBasemap={selectBasemap}
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
        basemap: state.map.basemap,
        basemaps: state.basemaps,
    }),
    {
        changeBasemapOpacity,
        toggleBasemapExpand,
        toggleBasemapVisibility,
        selectBasemap,
    }
)(BasemapCard);
