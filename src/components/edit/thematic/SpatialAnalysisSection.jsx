import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSpatialAnalysis } from '../../../actions/layerEdit.js'
import {
    SPATIAL_NONE,
    SPATIAL_GI,
    SPATIAL_LISA,
    WEIGHTS_CONTIGUITY,
    WEIGHTS_DISTANCE_BAND,
    WEIGHTS_KNN,
} from '../../../constants/layers.js'
import { Checkbox, NumberField, SelectField } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'

// Generates a simple integer seed from the current time.
const generateSeed = () => Math.floor(Date.now() % 1_000_000)

const METHODS = [
    { id: SPATIAL_NONE, name: i18n.t('Off') },
    { id: SPATIAL_GI, name: i18n.t('Getis-Ord Gi*') },
    { id: SPATIAL_LISA, name: i18n.t("Local Moran's I (LISA)") },
]

const WEIGHT_TYPES = [
    { id: WEIGHTS_CONTIGUITY, name: i18n.t('Contiguity (queen)') },
    { id: `${WEIGHTS_CONTIGUITY}_rook`, name: i18n.t('Contiguity (rook)') },
    { id: WEIGHTS_DISTANCE_BAND, name: i18n.t('Distance band') },
    { id: WEIGHTS_KNN, name: i18n.t('k-nearest neighbours') },
]

// Numeric ids round-trip cleanly through SelectField's String(id) comparison
// (unlike hand-written string literals such as '0.10', which Number()
// collapses to '0.1' and breaks the selected-option match).
const ALPHA_OPTIONS = [
    { id: 0.1, name: '0.10' },
    { id: 0.05, name: '0.05 (default)' },
    { id: 0.01, name: '0.01' },
]

const PERMUTATION_OPTIONS = [
    { id: 99, name: '99' },
    { id: 999, name: '999 (default)' },
    { id: 9999, name: '9999' },
]

const CORRECTION_OPTIONS = [
    { id: 'fdr', name: i18n.t('FDR (recommended)') },
    { id: 'bonferroni', name: i18n.t('Bonferroni') },
    { id: 'none', name: i18n.t('None') },
]

const QUADRANT_OPTIONS = [
    { id: 'geoda', name: i18n.t('GeoDa (default)') },
    { id: 'pysal', name: i18n.t('PySAL') },
]

const SpatialAnalysisSection = ({ isCountLikeData }) => {
    const dispatch = useDispatch()
    const spatialAnalysis = useSelector(
        (state) => state.layerEdit.spatialAnalysis ?? {}
    )

    const {
        method = SPATIAL_NONE,
        weightType: rawWeightType = WEIGHTS_CONTIGUITY,
        distanceMeters,
        k = 8,
        alpha = 0.05,
        permutations = 999,
        correction = 'fdr',
        quadrantScheme = 'geoda',
        rowStandardize = true,
        seed,
    } = spatialAnalysis

    // Encode contiguity + queen/rook into a single select value
    const weightSelectValue =
        rawWeightType === WEIGHTS_CONTIGUITY
            ? spatialAnalysis.contiguityType === 'rook'
                ? `${WEIGHTS_CONTIGUITY}_rook`
                : WEIGHTS_CONTIGUITY
            : rawWeightType

    const update = useCallback(
        (patch) => dispatch(setSpatialAnalysis(patch)),
        [dispatch]
    )

    const handleWeightTypeChange = (value) => {
        if (value === `${WEIGHTS_CONTIGUITY}_rook`) {
            update({ weightType: WEIGHTS_CONTIGUITY, contiguityType: 'rook' })
        } else if (value === WEIGHTS_CONTIGUITY) {
            update({ weightType: WEIGHTS_CONTIGUITY, contiguityType: 'queen' })
        } else {
            update({ weightType: value, contiguityType: undefined })
        }
    }

    const isActive = method !== SPATIAL_NONE
    const isLisa = method === SPATIAL_LISA
    const isDistanceBand = rawWeightType === WEIGHTS_DISTANCE_BAND
    const isKnn = rawWeightType === WEIGHTS_KNN

    // Auto-assign seed on first activation
    const handleMethodChange = (value) => {
        const patch = { method: value }
        if (value !== SPATIAL_NONE && !seed) {
            patch.seed = generateSeed()
        }
        update(patch)
    }

    return (
        <div data-test="spatialanalysissection">
            {isActive && isCountLikeData && (
                <div className={styles.fullWidthNotice}>
                    <NoticeBox warning>
                        {i18n.t(
                            'Hotspot analysis on raw counts often reflects population distribution rather than true spatial clustering. Consider using a rate or per-capita indicator.'
                        )}
                    </NoticeBox>
                </div>
            )}

            <div className={styles.flexColumnFlow}>
                <div className={styles.flexColumn}>
                    <SelectField
                        label={i18n.t('Spatial analysis method')}
                        value={method}
                        items={METHODS}
                        onChange={({ id }) => handleMethodChange(id)}
                        className={styles.select}
                        dataTest="spatialanalysis-method"
                    />

                    {isActive && (
                        <>
                            <SelectField
                                label={i18n.t('Spatial weights')}
                                value={weightSelectValue}
                                items={WEIGHT_TYPES}
                                onChange={({ id }) =>
                                    handleWeightTypeChange(id)
                                }
                                className={styles.select}
                                dataTest="spatialanalysis-weights"
                            />

                            {isDistanceBand && (
                                <NumberField
                                    label={i18n.t(
                                        'Distance threshold (metres)'
                                    )}
                                    value={distanceMeters}
                                    min={0}
                                    onChange={(value) =>
                                        update({ distanceMeters: value })
                                    }
                                    className={styles.select}
                                />
                            )}

                            {isKnn && (
                                <NumberField
                                    label={i18n.t('Number of neighbours (k)')}
                                    value={k}
                                    min={1}
                                    max={20}
                                    onChange={(value) =>
                                        update({
                                            k: Math.max(1, Math.min(20, value)),
                                        })
                                    }
                                    className={styles.select}
                                />
                            )}

                            <SelectField
                                label={i18n.t('Significance level (α)')}
                                value={alpha}
                                items={ALPHA_OPTIONS}
                                onChange={({ id }) => update({ alpha: id })}
                                className={styles.select}
                                dataTest="spatialanalysis-alpha"
                            />
                        </>
                    )}
                </div>

                {isActive && (
                    <div
                        className={styles.flexColumn}
                        data-test="spatialanalysis-advanced"
                    >
                        <div className={styles.header}>
                            {i18n.t('Advanced settings')}
                        </div>

                        {isLisa && (
                            <SelectField
                                label={i18n.t('Permutations')}
                                value={permutations}
                                items={PERMUTATION_OPTIONS}
                                onChange={({ id }) =>
                                    update({ permutations: id })
                                }
                                className={styles.select}
                                dataTest="spatialanalysis-permutations"
                            />
                        )}

                        <SelectField
                            label={i18n.t('Multiple-comparison correction')}
                            value={correction}
                            items={CORRECTION_OPTIONS}
                            onChange={({ id }) => update({ correction: id })}
                            className={styles.select}
                            dataTest="spatialanalysis-correction"
                        />

                        {isLisa && (
                            <SelectField
                                label={i18n.t('Quadrant scheme')}
                                value={quadrantScheme}
                                items={QUADRANT_OPTIONS}
                                onChange={({ id }) =>
                                    update({ quadrantScheme: id })
                                }
                                className={styles.select}
                                dataTest="spatialanalysis-quadrant"
                            />
                        )}

                        <Checkbox
                            label={i18n.t('Row-standardize weights')}
                            checked={rowStandardize}
                            onChange={(checked) =>
                                update({ rowStandardize: checked })
                            }
                            dataTest="spatialanalysis-rowstandardize"
                        />

                        <NumberField
                            label={i18n.t('Random seed')}
                            value={seed}
                            onChange={(value) => update({ seed: value })}
                            className={styles.select}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

SpatialAnalysisSection.propTypes = {
    isCountLikeData: PropTypes.bool,
}

export default SpatialAnalysisSection
