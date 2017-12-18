import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadProgramIndicators } from '../../actions/programs';

export class ProgramIndicatorSelect extends Component {

    static propTypes = {
        programIndicator: PropTypes.object,
        programIndicators: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidUpdate() {
        const { program, programIndicator, programIndicators, onChange, loadProgramIndicators } = this.props;

        if (program) {
            const indicators = programIndicators[program.id];

            // Load program stages when program is selected
            if (!indicators) {
                loadProgramIndicators(program.id);
            }

            // Select first program stage if only one
            if (program && !programIndicator && indicators && indicators.length === 1) {
                onChange(indicators[0]);
            }
        }
    }

    render () {
        const { program, programIndicator, programIndicators, onChange, style } = this.props;

        if (!program || !programIndicators[program.id]) {
            return null; // TODO: Add loading indicator
        }

        return (
            <SelectField
                label={i18next.t('Event data item')}
                items={programIndicators[program.id]}
                value={programIndicator? programIndicator.id : null}
                onChange={onChange}
                style={style}
            />
        );
    }

}


export default connect(
    (state) => ({
        programIndicators: state.programIndicators,
    }),
    { loadProgramIndicators }
)(ProgramIndicatorSelect);

