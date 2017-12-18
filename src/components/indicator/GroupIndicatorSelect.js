import React, { Component } from 'react';
import i18next from 'i18next';
import { connect } from 'react-redux';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadIndicators } from '../../actions/indicators';

export class GroupIndicatorSelect extends Component {

    componentDidUpdate() {
        const { indicatorGroup, indicators, loadIndicators } = this.props;

        if (indicatorGroup && !indicators[indicatorGroup.id]) {
            loadIndicators(indicatorGroup.id);
        }
    }

    render() {
        const {
            indicatorGroup,
            indicator,
            indicators,
            onChange,
            style,
        } = this.props;

        if (!indicatorGroup || !indicators[indicatorGroup.id]) {
            return null; // TODO: Add loading indicator
        }

        return (
            <SelectField
                key='indicators'
                label={i18next.t('Indicator')}
                items={indicators[indicatorGroup.id]}
                value={indicator ? indicator.id : null}
                onChange={onChange}
                style={style}
            />
        );
    }
}

export default connect(
    (state) => ({
        indicators: state.indicators,
    }),
    { loadIndicators }
)(GroupIndicatorSelect);
