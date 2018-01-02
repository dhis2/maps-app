import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadProgramStages } from '../../actions/programs';

export class ProgramStageSelect extends Component {

    static propTypes = {
        program: PropTypes.object,
        programStage: PropTypes.object,
        programStages: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidUpdate() {
        const { program, programStage, programStages, loadProgramStages, onChange } = this.props;

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
        const { program, programStage, programStages, onChange, style, errorText } = this.props;

        if (!program) {
            return null;
        }

        const items = programStages[program.id];

        return (
            <SelectField
                label={i18next.t('Stage')}
                loading={items ? false : true}
                items={items}
                value={programStage ? programStage.id : null}
                onChange={onChange}
                style={style}
                errorText={!programStage && errorText ? errorText : null}
            />
        );
    }
}

export default connect(
    (state) => ({
        programStages: state.programStages,
    }),
    { loadProgramStages }
)(ProgramStageSelect);
