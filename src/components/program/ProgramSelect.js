import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '@dhis2/d2-ui-core';
import { loadPrograms } from '../../actions/programs';

const allProgramsItem = {
    id: 'allPrograms',
    name: i18n.t('All programs'),
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
        const { program, programs, allPrograms, onChange, style, errorText } = this.props;
        let programsAll;
        let value = program ? program.id : null;

        if (allPrograms && programs) {
            programsAll = [allProgramsItem, ...programs];
            if (!value) {
                value = 'allPrograms';
            }
        }   

        return (
            <SelectField
                label={i18n.t('Program')}
                loading={programs ? false : true}
                items={programsAll || programs}
                value={value}
                // onChange={onChange}
                onChange={this.onChange}
                style={style}
                errorText={!program && errorText ? errorText : null}
            />
        );
    }

    onChange = (program) => {
        this.props.onChange(program.id !== 'allPrograms' ? program : null);
    }
}

export default connect(
    state => ({
        programs: state.programs,
    }),
    { loadPrograms }
)(ProgramSelect);
