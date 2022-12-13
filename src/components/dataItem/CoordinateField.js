import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    loadProgramTrackedEntityAttributes,
    loadProgramStageDataElements,
} from '../../actions/programs.js'
import { SelectField } from '../core/index.js'

class CoordinateField extends Component {
    static propTypes = {
        dataElements: PropTypes.object.isRequired,
        loadProgramStageDataElements: PropTypes.func.isRequired,
        loadProgramTrackedEntityAttributes: PropTypes.func.isRequired,
        programAttributes: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        program: PropTypes.object,
        programStage: PropTypes.object,
        value: PropTypes.string,
    }

    componentDidMount() {
        this.loadData()
    }

    componentDidUpdate(prevProps) {
        const { program, onChange } = this.props

        if (program !== prevProps.program) {
            onChange('event')
        }

        this.loadData()
    }

    render() {
        const {
            value,
            program,
            programStage,
            programAttributes,
            dataElements,
            onChange,
            className,
        } = this.props
        let fields = [
            { id: 'event', name: i18n.t('Event location') }, // Default coordinate field
        ]

        if (program && programStage) {
            fields = fields.concat(
                [
                    ...(programAttributes[program.id] || []),
                    ...(dataElements[programStage.id] || []),
                ].filter((field) => field.valueType === 'COORDINATE')
            )
        }

        return (
            <SelectField
                label={i18n.t('Coordinate field')}
                items={fields}
                value={fields.find((f) => f.id === value) ? value : 'event'}
                onChange={(field) => onChange(field.id)}
                className={className}
            />
        )
    }

    loadData() {
        const {
            program,
            programStage,
            programAttributes,
            dataElements,
            loadProgramTrackedEntityAttributes,
            loadProgramStageDataElements,
        } = this.props

        if (program && !programAttributes[program.id]) {
            loadProgramTrackedEntityAttributes(program.id)
        }

        if (programStage && !dataElements[programStage.id]) {
            loadProgramStageDataElements(programStage.id)
        }
    }
}

export default connect(
    (state) => ({
        programAttributes: state.programTrackedEntityAttributes,
        dataElements: state.programStageDataElements,
    }),
    { loadProgramTrackedEntityAttributes, loadProgramStageDataElements }
)(CoordinateField)
