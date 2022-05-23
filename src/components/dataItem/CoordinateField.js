import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import {
    loadProgramTrackedEntityAttributes,
    loadProgramStageDataElements,
} from '../../actions/programs';

const CoordinateField = ({
    value,
    program,
    programStage,
    programAttributes,
    dataElements,
    loadProgramTrackedEntityAttributes,
    loadProgramStageDataElements,
    onChange,
    className,
}) => {
    const fields = useMemo(() => {
        const items = [
            { id: 'event', name: i18n.t('Event location') }, // Default coordinate field
            { id: 'enrollment', name: i18n.t('Enrollment coordinate') },
        ];

        return program && programStage
            ? items.concat(
                  [
                      ...(programAttributes[program.id] || []),
                      ...(dataElements[programStage.id] || []),
                  ].filter(field => field.valueType === 'COORDINATE')
              )
            : items;
    }, [program, programStage, programAttributes, dataElements]);

    useEffect(() => {
        if (program && !programAttributes[program.id]) {
            loadProgramTrackedEntityAttributes(program.id);
        }

        if (programStage && !dataElements[programStage.id]) {
            loadProgramStageDataElements(programStage.id);
        }
    }, [
        program,
        programAttributes,
        programStage,
        dataElements,
        loadProgramStageDataElements,
        loadProgramStageDataElements,
    ]);

    useEffect(() => {
        onChange('event');
    }, [program, onChange]);

    return (
        <SelectField
            label={i18n.t('Coordinate field')}
            items={fields}
            value={fields.find(f => f.id === value) ? value : 'event'}
            onChange={field => onChange(field.id)}
            className={className}
        />
    );
};

CoordinateField.propTypes = {
    value: PropTypes.string,
    program: PropTypes.object,
    programStage: PropTypes.object,
    programAttributes: PropTypes.object.isRequired,
    dataElements: PropTypes.object.isRequired,
    loadProgramTrackedEntityAttributes: PropTypes.func.isRequired,
    loadProgramStageDataElements: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default connect(
    state => ({
        programAttributes: state.programTrackedEntityAttributes,
        dataElements: state.programStageDataElements,
    }),
    { loadProgramTrackedEntityAttributes, loadProgramStageDataElements }
)(CoordinateField);
