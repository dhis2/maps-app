import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import {
    loadProgramTrackedEntityAttributes,
    loadProgramStageDataElements,
} from '../../actions/programs';

export class CoordinateField extends Component {
    static propTypes = {
        value: PropTypes.string,
        program: PropTypes.object,
        programStage: PropTypes.object,
        programAttributes: PropTypes.object.isRequired,
        dataElements: PropTypes.object.isRequired,
        loadProgramTrackedEntityAttributes: PropTypes.func.isRequired,
        loadProgramStageDataElements: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate() {
        this.loadData();
    }

    render() {
        const {
            value,
            program,
            programStage,
            programAttributes,
            dataElements,
            onChange,
            style,
        } = this.props;
        let fields = [
            { id: 'event', name: i18n.t('Event location') }, // Default coordinate field
        ];

        if (program && programStage) {
            fields = fields.concat(
                [
                    ...(programAttributes[program.id] || []),
                    ...(dataElements[programStage.id] || []),
                ].filter(field => field.valueType === 'COORDINATE')
            );
        }

        return (
            <SelectField
                label={i18n.t('Coordinate field')}
                items={fields}
                value={value || 'event'}
                onChange={field => onChange(field.id)}
                style={style}
            />
        );
    }

    loadData() {
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
}

export default connect(
    state => ({
        programAttributes: state.programTrackedEntityAttributes,
        dataElements: state.programStageDataElements,
    }),
    { loadProgramTrackedEntityAttributes, loadProgramStageDataElements }
)(CoordinateField);
