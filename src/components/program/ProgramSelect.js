import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import { SelectField } from '@dhis2/d2-ui-core';
import { loadPrograms } from '../../actions/programs';

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
        const { program, programs, onChange, style, errorText } = this.props;

        return (
            <SelectField
                label={i18next.t('Program')}
                loading={programs ? false : true}
                items={programs}
                value={program ? program.id : null}
                onChange={onChange}
                style={style}
                errorText={!program && errorText ? errorText : null}
            />
        );
    }
}

export default connect(
    state => ({
        programs: state.programs,
    }),
    { loadPrograms }
)(ProgramSelect);
