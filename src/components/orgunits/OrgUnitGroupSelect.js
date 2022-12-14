import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadOrgUnitGroups } from '../../actions/orgUnits.js'
import { SelectField } from '../core/index.js'

const style = {
    width: '100%',
    marginTop: -12,
}

export class OrgUnitGroupSelect extends Component {
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
