import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { SelectField } from '@dhis2/d2-ui-core';
import { loadIndicatorGroups } from '../../actions/indicators';

export class IndicatorGroupSelect extends Component {
    static propTypes = {
        indicatorGroups: PropTypes.array,
        indicatorGroup: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        loadIndicatorGroups: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
        errorText: PropTypes.string,
    };

    componentDidMount() {
        const { indicatorGroups, loadIndicatorGroups } = this.props;

        if (!indicatorGroups) {
            loadIndicatorGroups();
        }
    }

    render() {
        const {
            indicatorGroups,
            indicatorGroup,
            onChange,
            style,
            errorText,
        } = this.props;

        return (
            <SelectField
                label={i18n.t('Indicator group')}
                loading={indicatorGroups ? false : true}
                items={indicatorGroups}
                value={indicatorGroup ? indicatorGroup.id : null}
                onChange={onChange}
                style={style}
                errorText={!indicatorGroup && errorText ? errorText : null}
            />
        );
    }
}

export default connect(
    state => ({
        indicatorGroups: state.indicatorGroups,
    }),
    { loadIndicatorGroups }
)(IndicatorGroupSelect);
