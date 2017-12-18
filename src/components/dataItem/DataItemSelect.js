import React, { Component } from 'react';
import i18next from 'i18next';
import { connect } from 'react-redux';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { combineDataItems } from '../../util/analytics';
import { loadProgramTrackedEntityAttributes, loadProgramStageDataElements } from '../../actions/programs';

export class DataItemSelect extends Component {

    componentDidMount() {
        this.loadDataItems();
    }

    componentDidUpdate() {
        this.loadDataItems();
    }

    // TODO: Make sure data load is only triggered once
    // TODO: Don't call more than needed
    loadDataItems() {
        const {
            program,
            programStage,
            programAttributes,
            dataElements,
            loadProgramTrackedEntityAttributes,
            loadProgramStageDataElements
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
            onChange,
            style,
        } = this.props;

        if (!program) {
            return null;
        }

        const dataItems = combineDataItems(
            programAttributes[program.id],
            programStage ? dataElements[programStage.id] : [],
            ['FILE_RESOURCE', 'ORGANISATION_UNIT', 'COORDINATE'] // Exclude some value types
        );

        return (
            <SelectField
                label={label || i18next.t('Data item')}
                items={dataItems}
                value={value}
                onChange={onChange}
                style={style}
            />
        );
    }
}


export default connect(
    (state) => ({
        programAttributes: state.programTrackedEntityAttributes,
        dataElements: state.programStageDataElements,
    }),
    { loadProgramTrackedEntityAttributes, loadProgramStageDataElements }
)(DataItemSelect);
