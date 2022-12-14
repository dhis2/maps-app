import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
    toggleOrgUnit,
    setRadiusLow,
    setOrganisationUnitColor,
} from '../../../actions/layerEdit.js'
import {
    ORG_UNIT_COLOR,
    ORG_UNIT_RADIUS,
    STYLE_TYPE_COLOR,
    MIN_RADIUS,
    MAX_RADIUS,
} from '../../../constants/layers.js'
import {
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
    getOrgUnitLevelsFromRows,
    getOrgUnitGroupsFromRows,
    getUserOrgUnitsFromRows,
} from '../../../util/analytics.js'
import { Tab, Tabs, NumberField, ColorPicker } from '../../core/index.js'
import StyleByGroupSet from '../../groupSet/StyleByGroupSet.js'
import OrgUnitFieldSelect from '../../orgunits/OrgUnitFieldSelect.js'
import OrgUnitGroupSelect from '../../orgunits/OrgUnitGroupSelect.js'
import OrgUnitLevelSelect from '../../orgunits/OrgUnitLevelSelect.js'
import OrgUnitTree from '../../orgunits/OrgUnitTree.js'
import UserOrgUnitsSelect from '../../orgunits/UserOrgUnitsSelect.js'
import Labels from '../shared/Labels.js'
import styles from '../styles/LayerDialog.module.css'

class OrgUnitDialog extends Component {
    static propTypes = {
        setOrgUnitGroups: PropTypes.func.isRequired,
        setOrgUnitLevels: PropTypes.func.isRequired,
        setOrganisationUnitColor: PropTypes.func.isRequired,
        setRadiusLow: PropTypes.func.isRequired,
        setUserOrgUnits: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        organisationUnitColor: PropTypes.string,
        radiusLow: PropTypes.number,
        rows: PropTypes.array,
    }

    state = {
        tab: 'orgunits',
    }

    componentDidUpdate(prev) {
        const { validateLayer, onLayerValidation } = this.props

        if (validateLayer && validateLayer !== prev.validateLayer) {
            onLayerValidation(this.validate())
        }
    }

    render() {
        const {
            rows = [],
            radiusLow,
            organisationUnitColor,
            setOrgUnitLevels,
            setOrgUnitGroups,
            setUserOrgUnits,
            toggleOrgUnit,
            setOrganisationUnitColor,
            setRadiusLow,
        } = this.props

        const { tab, orgUnitsError } = this.state

        const orgUnits = getOrgUnitsFromRows(rows)
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows)
        const hasUserOrgUnits = !!selectedUserOrgUnits.length

        return (
            <div className={styles.content} data-test="orgunitdialog">
                <Tabs value={tab} onChange={(tab) => this.setState({ tab })}>
                    <Tab value="orgunits">{i18n.t('Organisation Units')}</Tab>
                    <Tab value="style">{i18n.t('Style')}</Tab>
                </Tabs>
                <div className={styles.tabContent}>
                    {tab === 'orgunits' && (
                        <div
                            className={styles.flexColumnFlow}
                            data-test="orgunitdialog-orgunitstab"
                        >
                            <div className={styles.orgUnitTree}>
                                <OrgUnitTree
                                    selected={getOrgUnitNodesFromRows(rows)}
                                    onClick={toggleOrgUnit}
                                    disabled={hasUserOrgUnits}
                                />
                            </div>
                            <div className={styles.flexColumn}>
                                <OrgUnitLevelSelect
                                    orgUnitLevel={getOrgUnitLevelsFromRows(
                                        rows
                                    )}
                                    onChange={setOrgUnitLevels}
                                    disabled={hasUserOrgUnits}
                                />
                                <OrgUnitGroupSelect
                                    orgUnitGroup={getOrgUnitGroupsFromRows(
                                        rows
                                    )}
                                    onChange={setOrgUnitGroups}
                                    disabled={hasUserOrgUnits}
                                />
                                <UserOrgUnitsSelect
                                    selected={selectedUserOrgUnits}
                                    onChange={setUserOrgUnits}
                                />
                                <OrgUnitFieldSelect />
                                {!orgUnits.length && orgUnitsError && (
                                    <div className={styles.error}>
                                        {orgUnitsError}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {tab === 'style' && (
                        <div
                            className={styles.flexColumnFlow}
                            data-test="orgunitdialog-styletab"
                        >
                            <div className={styles.flexColumn}>
                                <Labels />
                                <ColorPicker
                                    label={i18n.t('Boundary color')}
                                    color={
                                        organisationUnitColor || ORG_UNIT_COLOR
                                    }
                                    onChange={setOrganisationUnitColor}
                                    className={styles.narrowField}
                                />
                                <NumberField
                                    label={i18n.t('Point radius')}
                                    min={MIN_RADIUS}
                                    max={MAX_RADIUS}
                                    value={
                                        radiusLow !== undefined
                                            ? radiusLow
                                            : ORG_UNIT_RADIUS
                                    }
                                    onChange={setRadiusLow}
                                    className={styles.narrowFieldIcon}
                                />
                            </div>
                            <div className={styles.flexColumn}>
                                <StyleByGroupSet
                                    defaultStyleType={STYLE_TYPE_COLOR}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // TODO: Add to parent class?
    setErrorState(key, message, tab) {
        this.setState({
            [key]: message,
            tab,
        })

        return false
    }

    validate() {
        const { rows } = this.props

        if (!getOrgUnitsFromRows(rows).length) {
            return this.setErrorState(
                'orgUnitsError',
                i18n.t('No organisation units are selected'),
                'orgunits'
            )
        }

        return true
    }
}

export default connect(
    null,
    {
        setOrgUnitLevels,
        setOrgUnitGroups,
        setUserOrgUnits,
        toggleOrgUnit,
        setRadiusLow,
        setOrganisationUnitColor,
    },
    null,
    {
        forwardRef: true,
    }
)(OrgUnitDialog)
