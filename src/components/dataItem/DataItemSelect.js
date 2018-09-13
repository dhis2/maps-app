import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import SelectField from '../core/SelectField';
import { combineDataItems } from '../../util/analytics';
import {
    loadProgramTrackedEntityAttributes,
    loadProgramStageDataElements,
} from '../../actions/programs';

export class DataItemSelect extends Component {
    static propTypes = {
        label: PropTypes.string,
        value: PropTypes.string,
        program: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        programStage: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        programAttributes: PropTypes.object.isRequired,
        dataElements: PropTypes.object.isRequired,
        includeTypes: PropTypes.array,
        excludeTypes: PropTypes.array,
        loadProgramTrackedEntityAttributes: PropTypes.func,
        loadProgramStageDataElements: PropTypes.func,
        onChange: PropTypes.func,
        style: PropTypes.object,
    };

    componentDidMount() {
        this.loadDataItems();
    }

    componentDidUpdate() {
        this.loadDataItems();
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
        } = this.props;

        if (program && !programAttributes[program.id]) {
            loadProgramTrackedEntityAttributes(program.id);
        }

        if (programStage && !dataElements[programStage.id]) {
            loadProgramStageDataElements(programStage.id);
        }
    }

    render() {
        const {
            label,
            value,
            program,
            programStage,
            programAttributes,
            dataElements,
            includeTypes,
            excludeTypes,
            onChange,
            style,
        } = this.props;

        if (!program) {
            return null;
        }

        const dataItems = combineDataItems(
            programAttributes[program.id],
            programStage ? dataElements[programStage.id] : [],
            includeTypes,
            excludeTypes
        );

        return (
            <SelectField
                label={label || i18n.t('Data item')}
                items={dataItems}
                value={value}
                onChange={onChange}
                style={style}
            />
        );
    }
}

export default connect(
    state => ({
        programAttributes: state.programTrackedEntityAttributes,
        dataElements: state.programStageDataElements,
    }),
    { loadProgramTrackedEntityAttributes, loadProgramStageDataElements }
)(DataItemSelect);
