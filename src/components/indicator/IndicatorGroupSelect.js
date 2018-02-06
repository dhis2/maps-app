import React, { Component } from 'react';
import i18next from 'i18next';
import { connect } from 'react-redux';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadIndicatorGroups } from '../../actions/indicators';

export class IndicatorGroupSelect  extends Component {

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
                label={i18next.t('Indicator group')}
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
    (state) => ({
        indicatorGroups: state.indicatorGroups,
    }),
    { loadIndicatorGroups }
)(IndicatorGroupSelect);

