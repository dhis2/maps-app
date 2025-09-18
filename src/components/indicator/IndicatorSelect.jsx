import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { SelectField } from '../core/index.js'

// Load all indicators within a group
const INDICATORS_QUERY = {
    indicators: {
        resource: 'indicators',
        params: ({ groupId, nameProperty }) => ({
            filter: `indicatorGroups.id:eq:${groupId}`,
            fields: ['id', `${nameProperty}~rename(name)`, 'legendSet[id]'],
            paging: false,
        }),
    },
}

const IndicatorSelect = ({
    indicator,
    indicatorGroup,
    onChange,
    className,
    errorText,
}) => {
    const { nameProperty } = useCachedData()
    const { loading, error, data, refetch } = useDataQuery(INDICATORS_QUERY, {
        lazy: true,
    })

    useEffect(() => {
        if (indicatorGroup) {
            refetch({
                groupId: indicatorGroup.id,
                nameProperty,
            })
        }
    }, [indicatorGroup, nameProperty, refetch])

    if (!indicatorGroup && !indicator) {
        return null
    }

    let items = data?.indicators.indicators

    if (!items && indicator) {
        items = [indicator] // If favorite is loaded, we only know the used indicator
    }

    return (
        <SelectField
            key="indicators"
            loading={loading}
            label={i18n.t('Indicator')}
            items={items}
            value={indicator?.id}
            onChange={(dataItem) => onChange(dataItem, 'indicator')}
            className={className}
            errorText={
                error?.message || (!indicator && errorText ? errorText : null)
            }
            dataTest="indicatorselect"
        />
    )
}

IndicatorSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    indicator: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    indicatorGroup: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default IndicatorSelect
