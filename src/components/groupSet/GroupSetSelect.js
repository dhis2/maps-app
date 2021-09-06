import React, { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { loadOrgUnitGroupSets } from '../../actions/orgUnits';

export const GroupSetSelect = ({
    label = i18n.t('Group set'),
    orgUnitGroupSets,
    value,
    allowNone,
    onChange,
    loadOrgUnitGroupSets,
    errorText,
    className,
}) => {
    const groupSets = useMemo(
        () => [
            ...(allowNone ? [{ id: 'none', name: i18n.t('None') }] : []),
            ...(orgUnitGroupSets || []),
        ],
        [orgUnitGroupSets, allowNone]
    );

    const onGroupSetChange = useCallback(
        item => onChange(item.id !== 'none' ? item : null),
        [onChange]
    );

    useEffect(() => {
        if (!orgUnitGroupSets) {
            loadOrgUnitGroupSets();
        }
    }, [orgUnitGroupSets, loadOrgUnitGroupSets]);

    return (
        <SelectField
            label={label}
            loading={orgUnitGroupSets ? false : true}
            items={groupSets}
            value={value ? value.id : null}
            onChange={onGroupSetChange}
            errorText={!value && errorText ? errorText : null}
            className={className}
            data-test="orgunitgroupsetselect"
        />
    );
};

GroupSetSelect.propTypes = {
    label: PropTypes.string,
    value: PropTypes.object,
    allowNone: PropTypes.bool,
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
)(GroupSetSelect);
