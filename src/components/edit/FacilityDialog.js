import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
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

const QUERY = {
    configuration: {
        resource: 'configuration',
    },
}

const ORGUNITS_TAB = 'orgunits'

const FacilityDialog = ({
    rows = [],
    radiusLow,
    organisationUnitColor,
    organisationUnitGroupSet,
    orgUnitField,
    id,
    validateLayer,
    onLayerValidation,
}) => {
    const [tab, setTab] = useState(ORGUNITS_TAB)
    const [orgUnitsError, setOrgUnitsError] = useState()
    const { data } = useDataQuery(QUERY)
    const dispatch = useDispatch()

    const facilityOrgUnitLevel = data?.configuration.facilityOrgUnitLevel
    const facilityOrgUnitGroupSet = data?.configuration.facilityOrgUnitGroupSet

    const orgUnits = getOrgUnitsFromRows(rows)

    const hasOrgUnits = useCallback(() => {
        if (!orgUnits.length) {
            setTab(ORGUNITS_TAB)
            setOrgUnitsError(i18n.t('No organisation units are selected'))
            return false
        }

        return true
    }, [orgUnits])

    useEffect(() => {
        if (validateLayer) {
            onLayerValidation(hasOrgUnits())
        }
    }, [validateLayer, onLayerValidation, hasOrgUnits])

    useEffect(() => {
        if (!id) {
            // Set default org unit level
            if (facilityOrgUnitLevel) {
                dispatch(setOrgUnitLevels([facilityOrgUnitLevel.id]))
            }

            // Set default org unit group set
            if (facilityOrgUnitGroupSet) {
                dispatch(setOrganisationUnitGroupSet(facilityOrgUnitGroupSet))
            }
        }
    }, [id, facilityOrgUnitLevel, facilityOrgUnitGroupSet, dispatch])

    const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows)
    const hasUserOrgUnits = !!selectedUserOrgUnits.length
    const hasOrgUnitField = !!orgUnitField && orgUnitField !== NONE

    return (
        <div className={styles.content} data-test="facilitydialog">
            <Tabs value={tab} onChange={setTab}>
                <Tab value={ORGUNITS_TAB}>{i18n.t('Organisation Units')}</Tab>
                <Tab value="style">{i18n.t('Style')}</Tab>
            </Tabs>
            <div className={styles.tabContent}>
                {tab === ORGUNITS_TAB && (
                    <div
                        className={styles.flexColumnFlow}
                        data-test="facilitydialog-orgunitstab"
                    >
                        <div className={styles.orgUnitTree}>
                            <OrgUnitTree
                                selected={getOrgUnitNodesFromRows(rows)}
                                onClick={(val) => dispatch(toggleOrgUnit(val))}
                                disabled={hasUserOrgUnits}
                            />
                        </div>
                        <div className={styles.flexColumn}>
                            <OrgUnitLevelSelect
                                orgUnitLevel={getOrgUnitLevelsFromRows(rows)}
                                onChange={(val) =>
                                    dispatch(setOrgUnitLevels(val))
                                }
                                disabled={hasUserOrgUnits}
                            />
                            <OrgUnitGroupSelect
                                orgUnitGroup={getOrgUnitGroupsFromRows(rows)}
                                onChange={(val) =>
                                    dispatch(setOrgUnitGroups(val))
                                }
                                disabled={hasUserOrgUnits}
                            />
                            <UserOrgUnitsSelect
                                selected={selectedUserOrgUnits}
                                onChange={(val) =>
                                    dispatch(setUserOrgUnits(val))
                                }
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
                                        onChange={(val) =>
                                            dispatch(
                                                setOrganisationUnitColor(val)
                                            )
                                        }
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
                                        onChange={(val) =>
                                            dispatch(setRadiusLow(val))
                                        }
                                        disabled={!!organisationUnitGroupSet}
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

FacilityDialog.propTypes = {
    validateLayer: PropTypes.bool.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
    id: PropTypes.string,
    orgUnitField: PropTypes.string,
    organisationUnitColor: PropTypes.string,
    organisationUnitGroupSet: PropTypes.object,
    radiusLow: PropTypes.number,
    rows: PropTypes.array,
}

export default FacilityDialog
