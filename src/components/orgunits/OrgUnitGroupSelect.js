import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadOrgUnitGroups } from '../../actions/orgUnits.js'
import { SelectField } from '../core/index.js'

// Load org unit levels
const ORG_UNIT_GROUPS_QUERY = {
    levels: {
        resource: 'organisationUnitGroups',
        params: ({ nameProperty }) => ({
            fields: ['id', `${nameProperty}~rename(name)`],
            paging: false,
        }),
    },
}

const style = {
    width: '100%',
    marginTop: -12,
}

const OrgUnitGroupSelect = ({
    orgUnitGroup,
    orgUnitGroups,
    disabled,
    onChange,
}) => {}

OrgUnitGroupSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    orgUnitGroup: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
}

export default OrgUnitGroupSelect

/*
class OrgUnitGroupSelect extends Component {
    static propTypes = {
        loadOrgUnitGroups: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        orgUnitGroup: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        orgUnitGroups: PropTypes.array,
    }

    static defaultProps = {
        disabled: false,
    }

    componentDidMount() {
        const { orgUnitGroups, loadOrgUnitGroups } = this.props

        if (!orgUnitGroups) {
            loadOrgUnitGroups()
        }
    }

    render() {
        const { orgUnitGroup, orgUnitGroups, disabled, onChange } = this.props

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
                disabled={disabled}
            />
        )
    }
}

export default connect(
    (state) => ({
        orgUnitGroups: state.orgUnitGroups,
    }),
    { loadOrgUnitGroups }
)(OrgUnitGroupSelect)
*/
