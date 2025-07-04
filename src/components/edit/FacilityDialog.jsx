import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import {
    setOrgUnits,
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
import { getOrgUnitsFromRows } from '../../util/analytics.js'
import { Tab, Tabs, NumberField, ColorPicker } from '../core/index.js'
import StyleByGroupSet from '../groupSet/StyleByGroupSet.jsx'
import OrgUnitSelect from '../orgunits/OrgUnitSelect.jsx'
import BufferRadius from './shared/BufferRadius.jsx'
import Labels from './shared/Labels.jsx'
import styles from './styles/LayerDialog.module.css'

const QUERY = {
    configuration: {
        resource: 'configuration',
    },
}

const ORGUNITS_TAB = 'orgunits'
const DEFAULT_NO_ROWS = []

const FacilityDialog = ({
    rows = DEFAULT_NO_ROWS,
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
                const { id, name } = facilityOrgUnitLevel

                dispatch(
                    setOrgUnits({
                        dimension: 'ou',
                        items: [{ id: `LEVEL-${id}`, name }],
                    })
                )
            }

            // Set default org unit group set
            if (facilityOrgUnitGroupSet) {
                dispatch(setOrganisationUnitGroupSet(facilityOrgUnitGroupSet))
            }
        }
    }, [id, facilityOrgUnitLevel, facilityOrgUnitGroupSet, dispatch])

    const hasOrgUnitField = !!orgUnitField && orgUnitField !== NONE

    return (
        <div className={styles.content} data-test="facilitydialog">
            <Tabs value={tab} onChange={setTab}>
                <Tab value={ORGUNITS_TAB}>{i18n.t('Organisation Units')}</Tab>
                <Tab value="style">{i18n.t('Style')}</Tab>
            </Tabs>
            <div className={styles.tabContent}>
                {tab === ORGUNITS_TAB && (
                    <OrgUnitSelect warning={orgUnitsError} />
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
