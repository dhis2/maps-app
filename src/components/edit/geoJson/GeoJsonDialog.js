import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { setFeatureStyle } from '../../../actions/layerEdit'
import { Tab, Tabs } from '../../core.js'
import FeatureStyle from '../shared/FeatureStyle.js'
import styles from '../styles/LayerDialog.module.css'

const GeoJsonDialog = ({
    featureStyle,
    setFeatureStyle,
    validateLayer,
    onLayerValidation,
}) => {
    const [tab, setTab] = useState('style')

    useEffect(() => {
        if (validateLayer) {
            onLayerValidation(true) // TODO
        }
    }, [validateLayer, onLayerValidation])

    return (
        <div className={styles.content} data-test="orgunitdialog">
            <Tabs value={tab} onChange={setTab}>
                <Tab value="style">{i18n.t('Style')}</Tab>
            </Tabs>
            <div className={styles.tabContent}>
                {tab === 'style' && (
                    <div
                        className={styles.flexColumnFlow}
                        data-test="orgunitdialog-styletab"
                    >
                        <div className={styles.flexColumn}>
                            <FeatureStyle
                                style={featureStyle}
                                onChange={setFeatureStyle}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

GeoJsonDialog.propTypes = {
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
)(GeoJsonDialog)
