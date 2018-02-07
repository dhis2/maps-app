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
            errorText,
        } = this.props;

        let items;

        if (indicatorGroup) {
            items = indicators[indicatorGroup.id];
        } else {
            if (!indicator) {
                return null;
            }
            items = [indicator]; // If favorite is loaded, we only know the used indicator
        }

        return (
            <SelectField
                key='indicators'
                loading={items ? false : true}
                label={i18next.t('Indicator')}
                items={items}
                value={indicator ? indicator.id : null}
                onChange={onChange}
                style={style}
                errorText={!indicator && errorText ? errorText : null}
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
