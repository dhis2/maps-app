import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import {
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
import { getOrgUnitsFromRows } from '../../../util/analytics.js'
import { Tab, Tabs, NumberField, ColorPicker } from '../../core/index.js'
import StyleByGroupSet from '../../groupSet/StyleByGroupSet.jsx'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.jsx'
import Labels from '../shared/Labels.jsx'
import styles from '../styles/LayerDialog.module.css'

const OrgUnitDialog = ({
    validateLayer,
    onLayerValidation,
    organisationUnitColor,
    radiusLow,
    rows,
}) => {
    const dispatch = useDispatch()

    const [tab, setTab] = useState('orgunits')
    const [orgUnitsError, setOrgUnitsError] = useState(null)

    // --------------------------
    // Validation (was componentDidUpdate)
    // --------------------------
    useEffect(() => {
        if (validateLayer) {
            onLayerValidation(validate())
        }
    }, [validateLayer])

    // --------------------------
    // Validation handler
    // --------------------------
    const setErrorState = useCallback((message, tabName) => {
        setOrgUnitsError(message)
        setTab(tabName)
        return false
    }, [])

    const validate = useCallback(() => {
        if (!getOrgUnitsFromRows(rows).length) {
            return setErrorState(
                i18n.t('No organisation units are selected'),
                'orgunits'
            )
        }
        return true
    }, [rows, setErrorState])

    // --------------------------
    // Render
    // --------------------------
    return (
        <div className={styles.content} data-test="orgunitdialog">
            <Tabs value={tab} onChange={setTab}>
                <Tab value="orgunits">{i18n.t('Organisation Units')}</Tab>
                <Tab value="style">{i18n.t('Style')}</Tab>
            </Tabs>

            <div className={styles.tabContent}>
                {tab === 'orgunits' && (
                    <OrgUnitSelect warning={orgUnitsError} />
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
                                color={organisationUnitColor || ORG_UNIT_COLOR}
                                onChange={(color) =>
                                    dispatch(setOrganisationUnitColor(color))
                                }
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
                                onChange={(value) =>
                                    dispatch(setRadiusLow(value))
                                }
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

OrgUnitDialog.propTypes = {
    setOrganisationUnitColor: PropTypes.func,
    setRadiusLow: PropTypes.func,
    validateLayer: PropTypes.bool.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
    organisationUnitColor: PropTypes.string,
    radiusLow: PropTypes.number,
    rows: PropTypes.array,
}

export default OrgUnitDialog
