import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadOrgUnitGroups } from '../../actions/orgUnits';

const style = {
    width: '100%',
    marginTop: -12,
};

export class OrgUnitGroupSelect extends Component {
    static propTypes = {
        orgUnitGroup: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        orgUnitGroups: PropTypes.array,
        disabled: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    static defaultProps = {
        disabled: false,
    };

    componentDidMount() {
        const { orgUnitGroups, loadOrgUnitGroups } = this.props;

        if (!orgUnitGroups) {
            loadOrgUnitGroups();
        }
    }

    render() {
        const { orgUnitGroup, orgUnitGroups, disabled, onChange } = this.props;

        return (
            <SelectField
                label={i18next.t('Select groups')}
                loading={orgUnitGroups ? false : true}
                items={orgUnitGroups}
                value={orgUnitGroup}
                multiple={true}
                onChange={disabled ? null : onChange}
                style={style}
                disabled={disabled}
            />
        );
    }
}

export default connect(
    state => ({
        orgUnitGroups: state.orgUnitGroups,
    }),
    { loadOrgUnitGroups }
)(OrgUnitGroupSelect);
