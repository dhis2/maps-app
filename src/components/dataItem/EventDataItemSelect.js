import React, { Component } from 'react';
import i18next from 'i18next';
import { connect } from 'react-redux';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { combineDataItems } from '../../util/analytics';
import {
    loadProgramTrackedEntityAttributes,
    loadProgramDataElements,
} from '../../actions/programs';
import { aggregationTypes } from '../../constants/aggregationTypes';

export class EventDataItemSelect extends Component {
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
            programAttributes,
            dataElements,
            loadProgramTrackedEntityAttributes,
            loadProgramDataElements,
        } = this.props;

        if (program && !programAttributes[program.id]) {
            loadProgramTrackedEntityAttributes(program.id);
        }

        if (program && !dataElements[program.id]) {
            loadProgramDataElements(program.id);
        }
    }

    render() {
        const {
            dataItem,
            program,
            programAttributes,
            dataElements,
            onChange,
            style,
        } = this.props;

        const dataItems = combineDataItems(
            programAttributes[program.id],
            dataElements[program.id],
            [
                'FILE_RESOURCE',
                'ORGANISATION_UNIT',
                'COORDINATE',
                'DATE',
                'TEXT',
                'BOOLEAN',
            ] // Exclude some value types
        );

        // console.log('dataItem', dataItem);

        return (
            <SelectField
                label={i18next.t('Event data item')}
                items={dataItems}
                value={dataItem ? dataItem.id : null}
                onChange={dataItem => onChange(dataItem, 'eventDataItem')}
                style={style}
            />
        );
    }
}

export default connect(
    state => ({
        programAttributes: state.programTrackedEntityAttributes,
        dataElements: state.programDataElements,
    }),
    { loadProgramTrackedEntityAttributes, loadProgramDataElements }
)(EventDataItemSelect);
