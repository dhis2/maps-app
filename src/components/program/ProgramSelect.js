import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '@dhis2/d2-ui-core';
import { loadPrograms } from '../../actions/programs';

const allProgramsItem = {
    id: 'noPrograms',
    name: i18n.t('No programs'),
};

export class ProgramSelect extends Component {
    static propTypes = {
        program: PropTypes.object,
        programs: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
        errorText: PropTypes.string,
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
            onChange,
            style,
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
                style={style}
                errorText={!program && errorText ? errorText : null}
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
