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
    setOrganisationUnitGroupSet,
    setOrganisationUnitColor,
} from '../../actions/layerEdit.js'
import {
    ORG_UNIT_COLOR,
    ORG_UNIT_RADIUS,
    FACILITY_BUFFER,
    STYLE_TYPE_SYMBOL,
    MIN_RADIUS,
    MAX_RADIUS,
    NONE,
} from '../../constants/layers.js'
import {
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
    getOrgUnitLevelsFromRows,
    getOrgUnitGroupsFromRows,
    getUserOrgUnitsFromRows,
} from '../../util/analytics.js'
import { fetchFacilityConfigurations } from '../../util/orgUnits.js'
import { Tab, Tabs, NumberField, ColorPicker } from '../core/index.js'
import StyleByGroupSet from '../groupSet/StyleByGroupSet.js'
import OrgUnitFieldSelect from '../orgunits/OrgUnitFieldSelect.js'
import OrgUnitGroupSelect from '../orgunits/OrgUnitGroupSelect.js'
import OrgUnitLevelSelect from '../orgunits/OrgUnitLevelSelect.js'
import OrgUnitTree from '../orgunits/OrgUnitTree.js'
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect.js'
import BufferRadius from './shared/BufferRadius.js'
import Labels from './shared/Labels.js'
import styles from './styles/LayerDialog.module.css'

class FacilityDialog extends Component {
    static propTypes = {
        setOrgUnitGroups: PropTypes.func.isRequired,
        setOrgUnitLevels: PropTypes.func.isRequired,
        setOrganisationUnitColor: PropTypes.func.isRequired,
        setOrganisationUnitGroupSet: PropTypes.func.isRequired,
        setRadiusLow: PropTypes.func.isRequired,
        setUserOrgUnits: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        id: PropTypes.string,
        orgUnitField: PropTypes.string,
        organisationUnitColor: PropTypes.string,
        organisationUnitGroupSet: PropTypes.object,
        radiusLow: PropTypes.number,
        rows: PropTypes.array,
    }

    constructor(props, context) {
        super(props, context)
        this.state = {
            tab: 'orgunits',
        }
    }

    componentDidMount() {
        fetchFacilityConfigurations().then((config) => this.setState(config))
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            id,
            rows,
            setOrgUnitLevels,
            organisationUnitGroupSet,
            setOrganisationUnitGroupSet,
            validateLayer,
            onLayerValidation,
        } = this.props

        const { facilityOrgUnitLevel, facilityOrgUnitGroupSet } = this.state

        // If new layer
        if (!id) {
            // Set default org unit level
            if (
                !getOrgUnitsFromRows(rows).length &&
                facilityOrgUnitLevel &&
                !prevState.facilityOrgUnitLevel
            ) {
                setOrgUnitLevels([facilityOrgUnitLevel.id])
            }

            // Set default org unit group set
            if (
                !organisationUnitGroupSet &&
                facilityOrgUnitGroupSet &&
                !prevState.facilityOrgUnitGroupSet
            ) {
                setOrganisationUnitGroupSet(facilityOrgUnitGroupSet)
            }
        }

        if (validateLayer && validateLayer !== prevProps.validateLayer) {
            onLayerValidation(this.validate())
        }
    }

    render() {
        const {
            rows = [],
            radiusLow,
            organisationUnitColor,
            organisationUnitGroupSet,
            orgUnitField,
            setOrgUnitLevels,
            setOrgUnitGroups,
            setUserOrgUnits,
            toggleOrgUnit,
            setRadiusLow,
            setOrganisationUnitColor,
        } = this.props

        const { tab, orgUnitsError } = this.state

        const orgUnits = getOrgUnitsFromRows(rows)
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows)
        const hasUserOrgUnits = !!selectedUserOrgUnits.length
        const hasOrgUnitField = !!orgUnitField && orgUnitField !== NONE

        return (
            <div className={styles.content} data-test="facilitydialog">
                <Tabs value={tab} onChange={(tab) => this.setState({ tab })}>
                    <Tab value="orgunits">{i18n.t('Organisation Units')}</Tab>
                    <Tab value="style">{i18n.t('Style')}</Tab>
                </Tabs>
                <div className={styles.tabContent}>
                    {tab === 'orgunits' && (
                        <div
                            className={styles.flexColumnFlow}
                            data-test="facilitydialog-orgunitstab"
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
                            data-test="facilitydialog-styletab"
                        >
                            <div className={styles.flexColumn}>
                                <Labels />
                                <BufferRadius
                                    defaultRadius={FACILITY_BUFFER}
                                    hasOrgUnitField={hasOrgUnitField}
                                />
                            </div>
                            <div className={styles.flexColumn}>
                                <StyleByGroupSet
                                    defaultStyleType={STYLE_TYPE_SYMBOL}
                                />
                                {!organisationUnitGroupSet && (
                                    <>
                                        <ColorPicker
                                            label={i18n.t('Point color')}
                                            color={
                                                organisationUnitColor ||
                                                ORG_UNIT_COLOR
                                            }
                                            onChange={setOrganisationUnitColor}
                                            className={styles.narrowField}
                                        />
                                        <NumberField
                                            label={i18n.t('Point radius')}
                                            value={
                                                radiusLow !== undefined
                                                    ? radiusLow
                                                    : ORG_UNIT_RADIUS
                                            }
                                            min={MIN_RADIUS}
                                            max={MAX_RADIUS}
                                            onChange={setRadiusLow}
                                            disabled={
                                                !!organisationUnitGroupSet
                                            }
                                            className={styles.narrowFieldIcon}
                                        />
                                    </>
                                )}
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
        setOrganisationUnitGroupSet,
        setOrganisationUnitColor,
    },
    null,
    {
        forwardRef: true,
    }
)(FacilityDialog)
