import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect } from 'react'
import { SelectField } from '../core/index.js'

// Load all stages for one program
const PROGRAM_STAGES_QUERY = {
    stages: {
        resource: 'programs',
        id: ({ id }) => id,
        params: {
            fields: ['programStages[id,displayName~rename(name)]'],
            paging: false,
        },
    },
}

const ProgramStageSelect = ({
    program,
    programStage,
    onChange,
    className,
    errorText,
}) => {
    const onProgramStagesLoad = useCallback(
        (data) => {
            // Select first program stage if only one
            if (!programStage && data.stages.programStages.length === 1) {
                onChange(data.stages.programStages[0])
            }
        },
        [programStage, onChange]
    )

    // https://runtime.dhis2.nu/#/hooks/useDataQuery
    const { loading, error, data, refetch } = useDataQuery(
        PROGRAM_STAGES_QUERY,
        {
            variables: { id: program.id },
            onComplete: onProgramStagesLoad,
            lazy: true,
        }
    )

    // Fetch program stages when program is changed
    useEffect(() => {
        refetch({ id: program.id })
    }, [program, refetch])

    // TODO: Handle error

    return (
        <SelectField
            label={i18n.t('Stage')}
            loading={loading}
            items={data?.stages.programStages}
            value={programStage?.id}
            onChange={onChange}
            className={className}
            errorText={!programStage && errorText ? errorText : null}
            dataTest="programstageselect"
        />
    )
}

ProgramStageSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    program: PropTypes.object,
    programStage: PropTypes.object,
}

export default ProgramStageSelect
