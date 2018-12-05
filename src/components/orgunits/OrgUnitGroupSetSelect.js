import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import { loadOrgUnitGroupSets } from '../../actions/orgUnits';

export class OrgUnitGroupSetSelect extends Component {
    static propTypes = {
        label: PropTypes.string,
        value: PropTypes.object,
        orgUnitGroupSets: PropTypes.array,
        loadOrgUnitGroupSets: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
        errorText: PropTypes.string,
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
            style,
            errorText,
        } = this.props;

        return (
            <SelectField
                label={i18n.t('Group set')}
                loading={orgUnitGroupSets ? false : true}
                items={orgUnitGroupSets}
                value={value ? value.id : null}
                onChange={onChange}
                style={style}
                errorText={!value && errorText ? errorText : null}
                data-test="orgunitgroupsetselect"
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
