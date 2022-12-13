import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    loadProgramTrackedEntityAttributes,
    loadProgramStageDataElements,
} from '../../actions/programs.js'
import { combineDataItems } from '../../util/analytics.js'
import { SelectField } from '../core/index.js'

export class DataItemSelect extends Component {
    static propTypes = {
        dataElements: PropTypes.object.isRequired,
        programAttributes: PropTypes.object.isRequired,
        allowNone: PropTypes.bool,
        className: PropTypes.string,
        excludeTypes: PropTypes.array,
        includeTypes: PropTypes.array,
        label: PropTypes.string,
        loadProgramStageDataElements: PropTypes.func,
        loadProgramTrackedEntityAttributes: PropTypes.func,
        program: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        programStage: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        value: PropTypes.string,
        onChange: PropTypes.func,
    }

    componentDidMount() {
        this.loadDataItems()
    }

    componentDidUpdate() {
        this.loadDataItems()
    }

    // TODO: Make sure data load is only triggered once
    loadDataItems() {
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

    render() {
        const {
            allowNone,
            label,
            value,
            program,
            programStage,
            programAttributes,
            dataElements,
            includeTypes,
            excludeTypes,
            className,
        } = this.props

        if (!program) {
            return null
        }

        const dataItems = [
            ...(allowNone ? [{ id: 'none', name: i18n.t('None') }] : []),
            ...combineDataItems(
                programAttributes[program.id],
                programStage ? dataElements[programStage.id] : [],
                includeTypes,
                excludeTypes
            ),
        ]

        return (
            <SelectField
                label={label || i18n.t('Data item')}
                items={dataItems}
                value={value}
                onChange={this.onChange}
                className={className}
            />
        )
    }

    onChange = (item) => this.props.onChange(item.id !== 'none' ? item : null)
}

export default connect(
    (state) => ({
        programAttributes: state.programTrackedEntityAttributes,
        dataElements: state.programStageDataElements,
    }),
    { loadProgramTrackedEntityAttributes, loadProgramStageDataElements }
)(DataItemSelect)
