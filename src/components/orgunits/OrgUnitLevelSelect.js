import i18n from '@dhis2/d2-i18n'
import { isValidUid } from 'd2/uid'
import { sortBy } from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadOrgUnitLevels } from '../../actions/orgUnits.js'
import { SelectField } from '../core/index.js'

const style = {
    marginTop: 0,
    marginBottom: 24,
}

export class OrgUnitLevelSelect extends Component {
    static propTypes = {
        loadOrgUnitLevels: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        orgUnitLevel: PropTypes.array,
        orgUnitLevels: PropTypes.array,
    }

    static defaultProps = {
        disabled: false,
    }

    componentDidMount() {
        const { orgUnitLevels, loadOrgUnitLevels } = this.props

        if (!orgUnitLevels) {
            loadOrgUnitLevels()
        }
    }

    render() {
        const { orgUnitLevel, orgUnitLevels, disabled, onChange } = this.props
        let sortedOrgUnitLevels

        if (orgUnitLevels) {
            sortedOrgUnitLevels = sortBy((item) => item.level, orgUnitLevels)
        }

        return (
            <SelectField
                label={i18n.t('Select levels')}
                loading={orgUnitLevels ? false : true}
                items={sortedOrgUnitLevels}
                value={this.getOrgUnitLevelUid(orgUnitLevel)}
                multiple={true}
                onChange={onChange}
                style={style}
                dataTest="orgunitlevelselect"
                disabled={disabled}
            />
        )
    }

    // Converts "LEVEL-x" to newer "LEVEL-uid" format
    getOrgUnitLevelUid(orgUnitLevel = []) {
        const { orgUnitLevels } = this.props

        return Array.isArray(orgUnitLevels)
            ? orgUnitLevel
                  .filter((level) =>
                      orgUnitLevels.find(
                          (l) => l.id === level || l.level === Number(level)
                      )
                  )
                  .map((level) =>
                      isValidUid(level)
                          ? level
                          : orgUnitLevels.find((l) => l.level === Number(level))
                                .id
                  )
            : []
    }
}

export default connect(
    ({ orgUnitLevels }) => ({
        orgUnitLevels,
    }),
    { loadOrgUnitLevels }
)(OrgUnitLevelSelect)
