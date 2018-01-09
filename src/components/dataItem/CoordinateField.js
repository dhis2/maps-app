import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';

const CoordinateField = ({ fields, value, onChange, style }) => (
    <SelectField
        label={i18next.t('Coordinate field')}
        items={fields}
        value={value || 'event'}
        onChange={field => onChange(field.id)}
        style={style}
    />
);

CoordinateField.propTypes = {
    fields: PropTypes.array.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired,
};

export default connect(
    (state, { program, programStage }) => {
        let fields = [
            { id: 'event', name: i18next.t('Event location') }, // Default cooridinate field
        ];

        if (program && programStage) {
            fields = fields.concat([
                ...state.programTrackedEntityAttributes[program.id] || [],
                ...state.programStageDataElements[programStage.id] || []
            ].filter(field => field.valueType === 'COORDINATE'));
        }

        return { fields };
    }
)(CoordinateField);
