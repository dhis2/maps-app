import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { SelectField } from '../core';
import { loadIndicators } from '../../actions/indicators';

export class IndicatorSelect extends Component {
    static propTypes = {
        indicatorGroup: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        indicator: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        indicators: PropTypes.array,
        loadIndicators: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        errorText: PropTypes.string,
    };

    componentDidUpdate() {
        const { indicatorGroup, indicators, loadIndicators } = this.props;

        if (indicatorGroup && !indicators) {
            loadIndicators(indicatorGroup.id);
        }
    }

    render() {
        const {
            indicatorGroup,
            indicator,
            indicators,
            onChange,
            className,
            errorText,
        } = this.props;

        let items = indicators;

        if (!indicatorGroup && !indicator) {
            return null;
        } else if (!indicators && indicator) {
            items = [indicator]; // If favorite is loaded, we only know the used indicator
        }

        return (
            <SelectField
                key="indicators"
                loading={items ? false : true}
                label={i18n.t('Indicator')}
                items={items}
                value={indicator ? indicator.id : null}
                onChange={dataItem => onChange(dataItem, 'indicator')}
                className={className}
                errorText={!indicator && errorText ? errorText : null}
                dataTest="indicatorselect"
            />
        );
    }
}

export default connect(
    (state, props) => ({
        indicators: props.indicatorGroup
            ? state.indicators[props.indicatorGroup.id]
            : null,
    }),
    { loadIndicators }
)(IndicatorSelect);
