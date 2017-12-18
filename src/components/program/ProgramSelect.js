import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadPrograms } from '../../actions/programs';

export class ProgramSelect extends Component {

    static propTypes = {
        program: PropTypes.object,
        programs: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        const { programs, loadPrograms } = this.props;

        if (!programs) {
            loadPrograms();
        }
    }

    render() {
        const { program, programs, onChange, style } = this.props;

        if (!programs) {
            return null; // TODO: Add loading indicator
        }

        return (
            <SelectField
                label={i18next.t('Program')}
                items={programs}
                value={program ? program.id : null}
                onChange={onChange}
                style={style}
            />
        );
    }
}

export default connect(
    (state) => ({
        programs: state.programs,
    }),
    { loadPrograms }
)(ProgramSelect);
