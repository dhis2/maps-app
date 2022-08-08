import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { loadProgramStages } from '../../actions/programs';

const ProgramStageSelect = ({
    program,
    programStage,
    programStages,
    onChange,
    loadProgramStages,
    className,
    errorText,
}) => {
    useEffect(() => {
        const stages = programStages[program.id];

        // Load program stages when program is selected
        if (!stages) {
            loadProgramStages(program.id);
        }

        // Select first program stage if only one
        if (program && !programStage && stages && stages.length === 1) {
            onChange(stages[0]);
        }
    }, [program, programStages, loadProgramStages, onChange]);

    let items = programStages[program.id];

    if (!items && programStage) {
        items = [programStage]; // If favorite is loaded, we only know the used program stage
    }

    return (
        <SelectField
            label={i18n.t('Stage')}
            loading={items ? false : true}
            items={items}
            value={programStage ? programStage.id : null}
            onChange={onChange}
            className={className}
            errorText={!programStage && errorText ? errorText : null}
            dataTest="programstageselect"
        />
    );
};

ProgramStageSelect.propTypes = {
    program: PropTypes.object,
    programStage: PropTypes.object,
    programStages: PropTypes.object,
    errorText: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    loadProgramStages: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default connect(
    state => ({
        programStages: state.programStages,
    }),
    { loadProgramStages }
)(ProgramStageSelect);
