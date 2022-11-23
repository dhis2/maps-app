import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useMemo, useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { loadOrgUnitGroupSets } from '../../actions/orgUnits.js'
import { SelectField } from '../core/index.js'

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
    )

    const onGroupSetChange = useCallback(
        (item) => onChange(item.id !== 'none' ? item : undefined),
        [onChange]
    )

    useEffect(() => {
        if (!orgUnitGroupSets) {
            loadOrgUnitGroupSets()
        }
    }, [orgUnitGroupSets, loadOrgUnitGroupSets])

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
    )
}

GroupSetSelect.propTypes = {
    loadOrgUnitGroupSets: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    allowNone: PropTypes.bool,
    className: PropTypes.string,
    errorText: PropTypes.string,
    label: PropTypes.string,
    orgUnitGroupSets: PropTypes.array,
    value: PropTypes.object,
}

export default connect(
    (state) => ({
        orgUnitGroupSets: state.orgUnitGroupSets,
    }),
    { loadOrgUnitGroupSets }
)(GroupSetSelect)
