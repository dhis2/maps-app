import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { SelectField } from '../core';
import { combineDataItems } from '../../util/analytics';
import {
    loadProgramTrackedEntityAttributes,
    loadProgramDataElements,
} from '../../actions/programs';

const excludeValueTypes = [
    'FILE_RESOURCE',
    'ORGANISATION_UNIT',
    'COORDINATE',
    'DATE',
    'TEXT',
    'BOOLEAN',
];

// Used in thematic layer dialog
export class EventDataItemSelect extends Component {
    static propTypes = {
        dataItem: PropTypes.object,
        program: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        programAttributes: PropTypes.object.isRequired,
        dataElements: PropTypes.object.isRequired,
        loadProgramTrackedEntityAttributes: PropTypes.func.isRequired,
        loadProgramDataElements: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        errorText: PropTypes.string,
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
            className,
            errorText,
        } = this.props;

        const dataItems = combineDataItems(
            programAttributes[program.id],
            dataElements[program.id],
            null,
            excludeValueTypes
        ).map(item => ({
            ...item,
            id: !item.id.includes('.') ? `${program.id}.${item.id}` : item.id, // Add program id to tracked entity attributes
        }));

        return (
            <SelectField
                label={i18n.t('Event data item')}
                items={dataItems}
                value={dataItem ? dataItem.id : null}
                onChange={dataItem => onChange(dataItem, 'eventDataItem')}
                className={className}
                errorText={!dataItem && errorText ? errorText : null}
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
