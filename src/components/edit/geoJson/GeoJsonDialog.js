import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setFeatureStyle } from '../../../actions/layerEdit.js'
import { Tab, Tabs } from '../../core/index.js'
import FeatureStyle from '../shared/FeatureStyle.js'
import styles from '../styles/LayerDialog.module.css'

const GeoJsonDialog = ({ featureStyle, validateLayer, onLayerValidation }) => {
    const [tab, setTab] = useState('style')
    const dispatch = useDispatch()

    useEffect(() => {
        if (validateLayer) {
            onLayerValidation(true)
        }
    }, [validateLayer, onLayerValidation])

    return (
        <div className={styles.content}>
            <Tabs value={tab} onChange={setTab}>
                <Tab value="style">{i18n.t('Style')}</Tab>
            </Tabs>
            <div className={styles.tabContent}>
                <div className={styles.flexColumnFlow}>
                    <div className={styles.flexColumn}>
                        <FeatureStyle
                            style={featureStyle}
                            onChange={(val) => dispatch(setFeatureStyle(val))}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

GeoJsonDialog.propTypes = {
    validateLayer: PropTypes.bool.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
    featureStyle: PropTypes.object,
}

export default GeoJsonDialog
