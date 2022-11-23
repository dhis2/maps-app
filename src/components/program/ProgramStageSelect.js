import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadProgramStages } from '../../actions/programs.js'
import { SelectField } from '../core/index.js'

export class ProgramStageSelect extends Component {
    static propTypes = {
        loadProgramStages: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        errorText: PropTypes.string,
        program: PropTypes.object,
        programStage: PropTypes.object,
        programStages: PropTypes.object,
    }

    componentDidUpdate() {
        const {
            program,
            programStage,
            programStages,
            loadProgramStages,
            onChange,
        } = this.props

        if (program) {
            const stages = programStages[program.id]

            // Load program stages when program is selected
            if (!stages) {
                loadProgramStages(program.id)
            }

            // Select first program stage if only one
            if (program && !programStage && stages && stages.length === 1) {
                onChange(stages[0])
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
        } = this.props

        if (!program) {
            return null
        }

        let items = programStages[program.id]

        if (!items && programStage) {
            items = [programStage] // If favorite is loaded, we only know the used program stage
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
        )
    }
}

export default connect(
    (state) => ({
        programStages: state.programStages,
    }),
    { loadProgramStages }
)(ProgramStageSelect)
