import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { SelectField } from '../core/index.js'

const allProgramsItem = {
    id: 'noPrograms',
    name: i18n.t('No program'),
}

// Load all programs
const PROGRAMS_QUERY = {
    programs: {
        resource: 'programs',
        params: ({ nameProperty }) => ({
            fields: [
                'id',
                `${nameProperty}~rename(name)`,
                'trackedEntityType[id,displayName~rename(name)]',
            ],
            paging: false,
        }),
    },
}

const ProgramSelect = ({
    program,
    trackedEntityType,
    className,
    errorText,
    onChange,
}) => {
    const { nameProperty } = useCachedData()
    const { loading, error, data } = useDataQuery(PROGRAMS_QUERY, {
        variables: { nameProperty },
    })

    const programs = data?.programs.programs
    let trackedEntityPrograms
    let value = program?.id

    if (programs && trackedEntityType) {
        trackedEntityPrograms = [
            allProgramsItem,
            ...programs.filter(
                (program) =>
                    program.trackedEntityType &&
                    program.trackedEntityType.id === trackedEntityType.id
            ),
        ]

        if (!value) {
            value = 'noPrograms'
        }
    }

    return (
        <SelectField
            label={i18n.t('Program')}
            loading={loading}
            items={trackedEntityPrograms || programs}
            value={value}
            onChange={(program) =>
                onChange(program.id !== 'noPrograms' ? program : null)
            }
            className={className}
            errorText={
                error?.message || (!program && errorText ? errorText : null)
            }
            dataTest="programselect"
        />
    )
}

ProgramSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    program: PropTypes.object,
    trackedEntityType: PropTypes.object,
}

export default ProgramSelect
