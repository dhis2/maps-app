import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { loadOrgUnitGroupSets } from '../../actions/orgUnits';

export const OrgUnitGroupSetSelect = ({
    label = i18n.t('Group set'),
    orgUnitGroupSets,
    value,
    onChange,
    loadOrgUnitGroupSets,
    errorText,
    className,
}) => {
    useEffect(() => {
        if (!orgUnitGroupSets) {
            loadOrgUnitGroupSets();
        }
    }, [orgUnitGroupSets, loadOrgUnitGroupSets]);

    return (
        <SelectField
            label={label}
            loading={orgUnitGroupSets ? false : true}
            items={orgUnitGroupSets}
            value={value ? value.id : null}
            onChange={onChange}
            errorText={!value && errorText ? errorText : null}
            className={className}
            data-test="orgunitgroupsetselect"
        />
    );
};

OrgUnitGroupSetSelect.propTypes = {
    label: PropTypes.string,
    value: PropTypes.object,
    orgUnitGroupSets: PropTypes.array,
    loadOrgUnitGroupSets: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    errorText: PropTypes.string,
    className: PropTypes.string,
};

export default connect(
    state => ({
        orgUnitGroupSets: state.orgUnitGroupSets,
    }),
    { loadOrgUnitGroupSets }
)(OrgUnitGroupSetSelect);
