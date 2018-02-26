import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadProgramTrackedEntityAttributes, loadProgramStageDataElements } from '../../actions/programs';

export class CoordinateField extends Component {

    componentDidUpdate() {
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
        const { value, program, programStage, programAttributes, dataElements, onChange, style } = this.props;
        let fields = [
            { id: 'event', name: i18next.t('Event location') }, // Default coordinate field
        ];

        if (program && programStage) {
            fields = fields.concat([
                ...programAttributes[program.id] || [],
                ...dataElements[programStage.id] || []
            ].filter(field => field.valueType === 'COORDINATE'));
        }

        return (
            <SelectField
                label={i18next.t('Coordinate field')}
                items={fields}
                value={value || 'event'}
                onChange={field => onChange(field.id)}
                style={style}
            />
        )
    }
}

export default connect(
    (state) => ({
        programAttributes: state.programTrackedEntityAttributes,
        dataElements: state.programStageDataElements,
    }),
    { loadProgramTrackedEntityAttributes, loadProgramStageDataElements }
)(CoordinateField);
