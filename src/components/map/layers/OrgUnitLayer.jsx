import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    ORG_UNIT_COLOR,
    GEOJSON_LAYER,
    LABEL_TEMPLATE_NAME_ONLY,
} from '../../../constants/layers.js'
import { filterData } from '../../../util/filter.js'
import { getLabelStyle } from '../../../util/labels.js'
import Popup from '../Popup.jsx'
import Layer from './Layer.js'
import styles from './styles/Popup.module.css'

export default class OrgUnitLayer extends Layer {
    state = {
        popup: null,
    }

    createLayer() {
        const {
            id,
            index,
            opacity,
            isVisible,
            data,
            labels,
            radiusLow,
            dataFilters,
            organisationUnitColor = ORG_UNIT_COLOR,
        } = this.props

        const filteredData = filterData(data, dataFilters)

        const map = this.context.map

        const config = {
            type: GEOJSON_LAYER,
            id,
            index,
            opacity,
            isVisible,
            data: filteredData,
            hoverLabel: '{name}',
            style: {
                color: 'transparent',
                strokeColor: organisationUnitColor,
            },
            onClick: this.onFeatureClick.bind(this),
            onRightClick: this.onFeatureRightClick.bind(this),
        }

        if (labels) {
            config.label = LABEL_TEMPLATE_NAME_ONLY
            config.labelStyle = getLabelStyle(this.props)
        }

        if (radiusLow) {
            config.style.radius = radiusLow
        }

        this.layer = map.createLayer(config)
        map.addLayer(this.layer)

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce()
    }

    getPopup() {
        const { coordinates, feature } = this.state.popup
        const { id, name, level, parentName } = feature.properties

        return (
            <Popup
                coordinates={coordinates}
                orgUnitId={id}
                onClose={this.onPopupClose}
                className={styles.orgUnitPopup}
            >
                <div className={styles.title}>{name}</div>
                {level && (
                    <div>
                        {i18n.t('Level')}: {level}
                    </div>
                )}
                {parentName && (
                    <div>
                        {i18n.t('Parent unit')}: {parentName}
                    </div>
                )}
            </Popup>
        )
    }

    render() {
        return this.state.popup ? this.getPopup() : null
    }

    onFeatureClick(evt) {
        this.setState({ popup: evt })
    }
}
