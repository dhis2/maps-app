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
            fields: 'programStages[id,displayName~rename(name)]',
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
            const stages = data.stages.programStages

            // Select first program stage if only one
            if (!programStage && stages?.length === 1) {
                onChange(stages[0])
            }
        },
        [programStage, onChange]
    )

    const { loading, error, data, refetch } = useDataQuery(
        PROGRAM_STAGES_QUERY,
        {
            onComplete: onProgramStagesLoad,
            lazy: true,
        }
    )

    // Fetch program stages when program is changed
    useEffect(() => {
        refetch({ id: program.id })
    }, [program, refetch])

    let items = data?.stages.programStages

    if (!items && programStage) {
        // If favorite is loaded, we only know the used program stage
        items = [programStage]
    }

    return (
        <SelectField
            label={i18n.t('Stage')}
            loading={loading}
            items={items}
            value={programStage?.id}
            onChange={onChange}
            className={className}
            errorText={
                error?.message ||
                (!programStage && errorText ? errorText : null)
            }
            dataTest="programstageselect"
        />
    )
}

ProgramStageSelect.propTypes = {
    program: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    programStage: PropTypes.object,
}

export default ProgramStageSelect
