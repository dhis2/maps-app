import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { loadPrograms } from '../../actions/programs';

const allProgramsItem = {
    id: 'noPrograms',
    name: i18n.t('No program'),
};

export class ProgramSelect extends Component {
    static propTypes = {
        program: PropTypes.object,
        programs: PropTypes.array,
        trackedEntityType: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        loadPrograms: PropTypes.func.isRequired,
        errorText: PropTypes.string,
        className: PropTypes.string,
    };

    componentDidMount() {
        const { programs, loadPrograms } = this.props;

        if (!programs) {
            loadPrograms();
        }
    }

    render() {
        const {
            program,
            programs,
            trackedEntityType,
            className,
            errorText,
        } = this.props;
        let trackedEntityPrograms;
        let value = program ? program.id : null;

        if (programs && trackedEntityType) {
            trackedEntityPrograms = [
                allProgramsItem,
                ...programs.filter(
                    program =>
                        program.trackedEntityType &&
                        program.trackedEntityType.id === trackedEntityType.id
                ),
            ];

            if (!value) {
                value = 'noPrograms';
            }
        }

        return (
            <SelectField
                label={i18n.t('Program')}
                loading={programs ? false : true}
                items={trackedEntityPrograms || programs}
                value={value}
                onChange={this.onChange}
                className={className}
                errorText={!program && errorText ? errorText : null}
                dataTest="programselect"
            />
        );
    }

    onChange = program => {
        this.props.onChange(program.id !== 'noPrograms' ? program : null);
    };
}

export default connect(
    state => ({
        programs: state.programs,
    }),
    { loadPrograms }
)(ProgramSelect);
