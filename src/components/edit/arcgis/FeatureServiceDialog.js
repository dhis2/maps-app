import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import i18n from '@dhis2/d2-i18n'
import { request } from '@esri/arcgis-rest-request'
import { Help, Tab, Tabs } from '../../core'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.js'
import FeatureServiceStyle from '../shared/FeatureStyle'
import { setFeatureStyle } from '../../../actions/layerEdit'
import { getOrgUnitNodesFromRows } from '../../../util/analytics'
import {
    setDrawingInfo,
    getFeatureStyleFields,
} from '../../../util/featureStyle'
import styles from '../styles/LayerDialog.module.css'

const FeatureServiceDialog = ({
    url,
    rows = [],
    featureStyle,
    setFeatureStyle,
    validateLayer,
    onLayerValidation,
}) => {
    const [tab, setTab] = useState('data')
    const [metadata, setMetadata] = useState()

    useEffect(() => {
        request(url).then(setMetadata)
    }, [url])

    useEffect(() => {
        if (metadata && !featureStyle) {
            // Set feature style from metadata drawiing ingo
            setFeatureStyle(setDrawingInfo(featureStyle, metadata.drawingInfo))
            // console.log('metadata', metadata);
        }
    }, [metadata, featureStyle])

    useEffect(() => {
        if (validateLayer) {
            onLayerValidation(true) // TODO
        }
    }, [validateLayer, onLayerValidation])

    return (
        <div className={styles.content} data-test="orgunitdialog">
            <Tabs value={tab} onChange={setTab}>
                <Tab value="data">{i18n.t('Data')}</Tab>
                <Tab value="orgunits">{i18n.t('Organisation Units')}</Tab>
                <Tab value="style">{i18n.t('Style')}</Tab>
            </Tabs>
            <div className={styles.tabContent}>
                {tab === 'data' && (
                    <div className={styles.flexRowFlow}>
                        <Help>
                            <>{metadata && <p>{metadata.description}</p>}</>
                        </Help>
                    </div>
                )}
                {tab === 'orgunits' && <OrgUnitSelect />}
                {tab === 'style' && (
                    <div
                        className={styles.flexColumnFlow}
                        data-test="orgunitdialog-styletab"
                    >
                        <div className={styles.flexColumn}>
                            {metadata && (
                                <FeatureServiceStyle
                                    fields={getFeatureStyleFields(
                                        metadata.geometryType
                                    )}
                                    style={featureStyle}
                                    onChange={setFeatureStyle}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

FeatureServiceDialog.propTypes = {
    url: PropTypes.string.isRequired,
    rows: PropTypes.array,
    featureStyle: PropTypes.object,
    setFeatureStyle: PropTypes.func.isRequired,
    validateLayer: PropTypes.bool.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
}

export default connect(
    null,
    {
        setFeatureStyle,
    },
    null,
    {
        forwardRef: true,
    }
)(FeatureServiceDialog)
