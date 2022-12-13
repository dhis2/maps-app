import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadProgramIndicators } from '../../actions/programs.js'
import { SelectField } from '../core/index.js'

export class ProgramIndicatorSelect extends Component {
    static propTypes = {
        loadProgramIndicators: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        errorText: PropTypes.string,
        program: PropTypes.object,
        programIndicator: PropTypes.object,
        programIndicators: PropTypes.object,
    }

    componentDidMount() {
        this.loadProgramIndicators()
    }

    componentDidUpdate() {
        this.loadProgramIndicators()
    }

    loadProgramIndicators() {
        const {
            program,
            programIndicator,
            programIndicators,
            onChange,
            loadProgramIndicators,
        } = this.props

        if (program) {
            const indicators = programIndicators[program.id]

            // Load program stages when program is selected
            if (!indicators) {
                loadProgramIndicators(program.id)
            }

            // Select first program indicator if only one
            if (
                program &&
                !programIndicator &&
                indicators &&
                indicators.length === 1
            ) {
                onChange(indicators[0])
            }
        }
    }

    render() {
        const {
            program,
            programIndicator,
            programIndicators,
            onChange,
            className,
            errorText,
        } = this.props

        if (!program) {
            return null
        }

        const items = programIndicators[program.id]

        return (
            <SelectField
                label={i18n.t('Program indicator')}
                loading={items ? false : true}
                items={items}
                value={programIndicator ? programIndicator.id : null}
                onChange={(programIndicator) =>
                    onChange(programIndicator, 'programIndicator')
                }
                className={className}
                errorText={!programIndicator && errorText ? errorText : null}
            />
        )
    }
}

export default connect(
    (state) => ({
        programIndicators: state.programIndicators,
    }),
    { loadProgramIndicators }
)(ProgramIndicatorSelect)
