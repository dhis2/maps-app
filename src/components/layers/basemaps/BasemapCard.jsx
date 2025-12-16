import i18n from '@dhis2/d2-i18n'
import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import {
    changeBasemapOpacity,
    toggleBasemapExpand,
    toggleBasemapVisibility,
    selectBasemap,
} from '../../../actions/basemap.js'
import { VECTOR_STYLE } from '../../../constants/layers.js'
import useBasemapConfig from '../../../hooks/useBasemapConfig.js'
import LayerCard from '../LayerCard.jsx'
import BasemapList from './BasemapList.jsx'

const BasemapCard = (props) => {
    const {
        subtitle = i18n.t('Basemap'),
        toggleBasemapExpand,
        toggleBasemapVisibility,
        changeBasemapOpacity,
        selectBasemap,
    } = props
    const basemap = useBasemapConfig(props.basemap)

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
                        selectBasemap={selectBasemap}
                    />
                </LayerCard>
            )}
        </>
    )
}

BasemapCard.propTypes = {
    basemap: PropTypes.object.isRequired,
    changeBasemapOpacity: PropTypes.func.isRequired,
    selectBasemap: PropTypes.func.isRequired,
    toggleBasemapExpand: PropTypes.func.isRequired,
    toggleBasemapVisibility: PropTypes.func.isRequired,
    subtitle: PropTypes.string,
}

export default connect(
    (state) => ({
        basemap: state.map.basemap,
    }),
    {
        changeBasemapOpacity,
        toggleBasemapExpand,
        toggleBasemapVisibility,
        selectBasemap,
    }
)(BasemapCard)
