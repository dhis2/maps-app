import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { loadOrgUnitGroupSets } from '../../actions/orgUnits';

export class OrgUnitGroupSetSelect extends Component {
    static propTypes = {
        label: PropTypes.string,
        value: PropTypes.object,
        orgUnitGroupSets: PropTypes.array,
        loadOrgUnitGroupSets: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        errorText: PropTypes.string,
        className: PropTypes.string,
    };

    componentDidMount() {
        const { orgUnitGroupSets, loadOrgUnitGroupSets } = this.props;

        if (!orgUnitGroupSets) {
            loadOrgUnitGroupSets();
        }
    }

    render() {
        const {
            orgUnitGroupSets,
            value,
            onChange,
            errorText,
            className,
        } = this.props;

        return (
            <SelectField
                label={i18n.t('Group set')}
                loading={orgUnitGroupSets ? false : true}
                items={orgUnitGroupSets}
                value={value ? value.id : null}
                onChange={onChange}
                errorText={!value && errorText ? errorText : null}
                className={className}
                dataTest="orgunitgroupsetselect"
            />
        );
    }
}

export default connect(
    state => ({
        orgUnitGroupSets: state.orgUnitGroupSets,
    }),
    { loadOrgUnitGroupSets }
)(OrgUnitGroupSetSelect);
