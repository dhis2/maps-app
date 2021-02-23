import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { loadProgramStages } from '../../actions/programs';

export class ProgramStageSelect extends Component {
    static propTypes = {
        program: PropTypes.object,
        programStage: PropTypes.object,
        programStages: PropTypes.object,
        errorText: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        loadProgramStages: PropTypes.func.isRequired,
        className: PropTypes.string,
    };

    componentDidUpdate() {
        const {
            program,
            programStage,
            programStages,
            loadProgramStages,
            onChange,
        } = this.props;

        if (program) {
            const stages = programStages[program.id];

            // Load program stages when program is selected
            if (!stages) {
                loadProgramStages(program.id);
            }

            // Select first program stage if only one
            if (program && !programStage && stages && stages.length === 1) {
                onChange(stages[0]);
            }
        }
    }

    render() {
        const {
            program,
            programStage,
            programStages,
            onChange,
            className,
            errorText,
        } = this.props;

        if (!program) {
            return null;
        }

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
                data-test="programstageselect"
            />
        );
    }
}

export default connect(
    state => ({
        programStages: state.programStages,
    }),
    { loadProgramStages }
)(ProgramStageSelect);
