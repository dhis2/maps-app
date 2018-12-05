import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import { loadOrgUnitGroups } from '../../actions/orgUnits';

const style = {
    width: '100%',
    marginTop: -12,
};

export class OrgUnitGroupSelect extends Component {
    static propTypes = {
        orgUnitGroup: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        orgUnitGroups: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        const { orgUnitGroups, loadOrgUnitGroups } = this.props;

        if (!orgUnitGroups) {
            loadOrgUnitGroups();
        }
    }

    render() {
        const { orgUnitGroup, orgUnitGroups, onChange } = this.props;

        return (
            <SelectField
                label={i18n.t('Select groups')}
                loading={orgUnitGroups ? false : true}
                items={orgUnitGroups}
                value={orgUnitGroup}
                multiple={true}
                onChange={onChange}
                style={style}
                data-test="orgunitgroupselect"
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
