import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { sortBy } from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.js'
import { SelectField } from '../core/index.js'

// Load program indicators for one program
const PROGRAM_INDICATORS_QUERY = {
    indicators: {
        resource: 'programIndicators',
        params: ({ id, nameProperty }) => ({
            filter: `program.id:eq:${id}`,
            fields: ['id', `${nameProperty}~rename(name)`],
            paging: false,
        }),
    },
}

const ProgramIndicatorSelect = ({
    program,
    programIndicator,
    onChange,
    className,
    errorText,
}) => {
    const { nameProperty } = useCachedData()

    const { data, loading, error, refetch } = useDataQuery(
        PROGRAM_INDICATORS_QUERY,
        {
            lazy: true,
        }
    )

    useEffect(() => {
        if (program) {
            refetch({
                id: program.id,
                nameProperty,
            })
        }
    }, [program, nameProperty, refetch])

    const indicators = sortBy('name', data?.indicators.programIndicators)

    return (
        <SelectField
            label={i18n.t('Program indicator')}
            loading={loading}
            items={indicators}
            value={programIndicator?.id}
            onChange={(programIndicator) =>
                onChange(programIndicator, 'programIndicator')
            }
            className={className}
            errorText={
                error?.message ||
                (!programIndicator && errorText ? errorText : null)
            }
        />
    )
}

ProgramIndicatorSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    program: PropTypes.object,
    programIndicator: PropTypes.object,
}

export default ProgramIndicatorSelect
