import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    setRadiusLow,
    setOrganisationUnitColor,
    setCountFeaturesWithoutCoordinates,
    setUnclassifiedLegend,
} from '../../../actions/layerEdit.js'
import {
    ORG_UNIT_COLOR,
    ORG_UNIT_RADIUS,
    STYLE_TYPE_COLOR,
    MIN_RADIUS,
    MAX_RADIUS,
} from '../../../constants/layers.js'
import { getOrgUnitsFromRows } from '../../../util/analytics.js'
import {
    Tab,
    Tabs,
    NumberField,
    ColorPicker,
    Checkbox,
} from '../../core/index.js'
import StyleByGroupSet from '../../groupSet/StyleByGroupSet.jsx'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.jsx'
import Labels from '../shared/Labels.jsx'
import UnclassifiedLegend from '../shared/UnclassifiedLegend.jsx'
import styles from '../styles/LayerDialog.module.css'

const ORGUNITS_TAB = 'orgunits'

const OrgUnitDialog = ({
    radiusLow,
    organisationUnitColor,
    organisationUnitGroupSet,
    unclassifiedLegend,
    rows,
    validateLayer,
    onLayerValidation,
}) => {
    const dispatch = useDispatch()
    const countFeaturesWithoutCoordinates = useSelector(
        (state) => state.layerEdit.countFeaturesWithoutCoordinates
    )
    const [tab, setTab] = useState(ORGUNITS_TAB)
    const [orgUnitsError, setOrgUnitsError] = useState()

    // Layer validation function
    const validate = useCallback(() => {
        if (!getOrgUnitsFromRows(rows).length) {
            setOrgUnitsError(i18n.t('No organisation units are selected'))
            setTab(ORGUNITS_TAB)
            return false
        }

        return true
    }, [rows])

    // Run layer validation
    useEffect(() => {
        if (validateLayer) {
            onLayerValidation(validate())
        }
    }, [validateLayer, onLayerValidation, validate])

    return (
        <div className={styles.content} data-test="orgunitdialog">
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
                        data-test="orgunitdialog-styletab"
                    >
                        <div className={styles.flexColumn}>
                            <Labels className={styles.noMarginTop} />
                            <ColorPicker
                                label={i18n.t('Boundary color')}
                                color={organisationUnitColor || ORG_UNIT_COLOR}
                                onChange={(val) =>
                                    dispatch(setOrganisationUnitColor(val))
                                }
                                className={cx(
                                    styles.narrowField,
                                    styles.marginTop
                                )}
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
                                onChange={(val) => dispatch(setRadiusLow(val))}
                                className={styles.narrowFieldIcon}
                            />
                            <Checkbox
                                label={i18n.t(
                                    'Count org units without coordinates'
                                )}
                                checked={!!countFeaturesWithoutCoordinates}
                                onChange={(checked) =>
                                    dispatch(
                                        setCountFeaturesWithoutCoordinates(
                                            checked
                                        )
                                    )
                                }
                            />
                        </div>
                        <div className={styles.flexColumn}>
                            <StyleByGroupSet
                                defaultStyleType={STYLE_TYPE_COLOR}
                            />
                            {organisationUnitGroupSet && (
                                <UnclassifiedLegend
                                    value={unclassifiedLegend}
                                    onChange={(val) =>
                                        dispatch(setUnclassifiedLegend(val))
                                    }
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

OrgUnitDialog.propTypes = {
    validateLayer: PropTypes.bool.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
    organisationUnitColor: PropTypes.string,
    organisationUnitGroupSet: PropTypes.object,
    radiusLow: PropTypes.number,
    rows: PropTypes.array,
    unclassifiedLegend: PropTypes.shape({
        color: PropTypes.string.isRequired,
        name: PropTypes.string,
    }),
}

export default OrgUnitDialog
