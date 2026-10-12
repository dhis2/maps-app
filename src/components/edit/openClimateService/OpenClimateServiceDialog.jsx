import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setOpenClimateServiceSelection } from '../../../actions/layerEdit.js'
import {
    fetchCollection,
    fetchOpenClimateServiceUrl,
    formatStep,
    getDefaultSelection,
    getDimensions,
} from '../../../util/openClimateService.js'
import { DatePicker, SelectField, Tab, Tabs } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'

const DAILY_STEP = 'P1D'

const getLabel = ({ key, isTemporal }) => {
    if (isTemporal) {
        return i18n.t('Period')
    }
    return key.charAt(0).toUpperCase() + key.slice(1).replaceAll('_', ' ')
}

const DimensionSelect = ({ dimension, value, onChange }) => {
    const { isTemporal, step, steps } = dimension
    const label = getLabel(dimension)

    // Daily datasets have too many steps for a select
    if (isTemporal && step === DAILY_STEP) {
        const first = steps[0]
        const last = steps[steps.length - 1]
        return (
            <>
                <DatePicker
                    label={label}
                    defaultVal={String(value)}
                    onBlur={(date) => steps.includes(date) && onChange(date)}
                />
                <div className={styles.paragraph}>
                    {i18n.t('Data is available from {{first}} to {{last}}', {
                        first,
                        last,
                    })}
                </div>
            </>
        )
    }

    // Latest period first
    const values = isTemporal ? [...steps].reverse() : steps
    const items = values.map((v) => ({
        id: v,
        name: formatStep(v, dimension),
    }))

    return (
        <SelectField
            label={label}
            items={items}
            value={value}
            filterable={items.length > 20}
            onChange={(item) => onChange(item.id)}
            className={styles.select}
        />
    )
}

DimensionSelect.propTypes = {
    dimension: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

const OpenClimateServiceDialog = ({
    config,
    validateLayer,
    onLayerValidation,
}) => {
    const [collection, setCollection] = useState()
    const [error, setError] = useState()
    const [tab, setTab] = useState('data')
    const engine = useDataEngine()
    const dispatch = useDispatch()
    const { datasetId, selection } = config

    useEffect(() => {
        fetchOpenClimateServiceUrl(engine)
            .then((url) => fetchCollection(url, datasetId))
            .then(setCollection)
            .catch(() => setError(i18n.t('The dataset is not available')))
    }, [engine, datasetId])

    const dimensions = useMemo(
        () => (collection ? getDimensions(collection) : []),
        [collection]
    )
    const values = { ...getDefaultSelection(dimensions), ...selection }

    useEffect(() => {
        if (validateLayer) {
            onLayerValidation(!!collection)
        }
    }, [validateLayer, onLayerValidation, collection])

    return (
        <div className={styles.content}>
            <Tabs value={tab} onChange={setTab}>
                <Tab value="data">{i18n.t('Data')}</Tab>
            </Tabs>
            <div className={styles.tabContent}>
                {error ? (
                    <div className={styles.error}>{error}</div>
                ) : !collection ? (
                    <CircularLoader small />
                ) : (
                    <div className={styles.flexRowFlow}>
                        {collection.description && (
                            <div className={styles.paragraph}>
                                {collection.description}
                            </div>
                        )}
                        {dimensions.map((dimension) => (
                            <DimensionSelect
                                key={dimension.key}
                                dimension={dimension}
                                value={values[dimension.key]}
                                onChange={(value) =>
                                    dispatch(
                                        setOpenClimateServiceSelection({
                                            [dimension.key]: value,
                                        })
                                    )
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

OpenClimateServiceDialog.propTypes = {
    config: PropTypes.shape({
        datasetId: PropTypes.string.isRequired,
        selection: PropTypes.object,
    }).isRequired,
    validateLayer: PropTypes.bool.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
}

export default OpenClimateServiceDialog
