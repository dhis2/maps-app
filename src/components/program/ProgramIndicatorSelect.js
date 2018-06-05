import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '@dhis2/d2-ui-core';
import { loadProgramIndicators } from '../../actions/programs';

export class ProgramIndicatorSelect extends Component {
    static propTypes = {
        programIndicator: PropTypes.object,
        programIndicators: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        this.loadProgramIndicators();
    }

    componentDidUpdate() {
        this.loadProgramIndicators();
    }

    loadProgramIndicators() {
        const {
            program,
            programIndicator,
            programIndicators,
            onChange,
            loadProgramIndicators,
        } = this.props;

        if (program) {
            const indicators = programIndicators[program.id];

            // Load program stages when program is selected
            if (!indicators) {
                loadProgramIndicators(program.id);
            }

            // Select first program indicator if only one
            if (
                program &&
                !programIndicator &&
                indicators &&
                indicators.length === 1
            ) {
                onChange(indicators[0]);
            }
        }
    }

    render() {
        const {
            program,
            programIndicator,
            programIndicators,
            onChange,
            style,
        } = this.props;

        if (!program) {
            return null;
        }

        const items = programIndicators[program.id];

        return (
            <SelectField
                label={i18n.t('Program indicator')}
                loading={items ? false : true}
                items={items}
                value={programIndicator ? programIndicator.id : null}
                onChange={programIndicator =>
                    onChange(programIndicator, 'programIndicator')
                }
                style={style}
            />
        );
    }
}

export default connect(
    state => ({
        programIndicators: state.programIndicators,
    }),
    { loadProgramIndicators }
)(ProgramIndicatorSelect);
