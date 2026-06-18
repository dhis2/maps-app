import i18n from '@dhis2/d2-i18n'
import {
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
    InputField,
    Checkbox,
    Button,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useCallback } from 'react'
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
import styles from '../styles/LayerDialog.module.css'

// Generates a simple integer seed from the current time.
const generateSeed = () => Math.floor(Date.now() % 1_000_000)

const METHODS = [
    { value: SPATIAL_NONE, label: i18n.t('Off') },
    { value: SPATIAL_GI, label: i18n.t('Getis-Ord Gi*') },
    { value: SPATIAL_LISA, label: i18n.t("Local Moran's I (LISA)") },
]

const WEIGHT_TYPES = [
    { value: WEIGHTS_CONTIGUITY, label: i18n.t('Contiguity (queen)') },
    { value: `${WEIGHTS_CONTIGUITY}_rook`, label: i18n.t('Contiguity (rook)') },
    { value: WEIGHTS_DISTANCE_BAND, label: i18n.t('Distance band') },
    { value: WEIGHTS_KNN, label: i18n.t('k-nearest neighbours') },
]

// Values must match String(Number(value)) exactly — selected={String(alpha)}
// compares against these, and Number('0.10') stringifies back to '0.1'.
const ALPHA_OPTIONS = [
    { value: '0.1', label: '0.10' },
    { value: '0.05', label: '0.05 (default)' },
    { value: '0.01', label: '0.01' },
]

const PERMUTATION_OPTIONS = [
    { value: '99', label: '99' },
    { value: '999', label: '999 (default)' },
    { value: '9999', label: '9999' },
]

const CORRECTION_OPTIONS = [
    { value: 'fdr', label: i18n.t('FDR (recommended)') },
    { value: 'bonferroni', label: i18n.t('Bonferroni') },
    { value: 'none', label: i18n.t('None') },
]

const QUADRANT_OPTIONS = [
    { value: 'geoda', label: i18n.t('GeoDa (default)') },
    { value: 'pysal', label: i18n.t('PySAL') },
]

const SpatialAnalysisSection = ({ isCountLikeData }) => {
    const dispatch = useDispatch()
    const spatialAnalysis = useSelector(
        (state) => state.layerEdit.spatialAnalysis ?? {}
    )
    const [showAdvanced, setShowAdvanced] = useState(false)

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
                <NoticeBox warning className={styles.noticeBox}>
                    {i18n.t(
                        'Hotspot analysis on raw counts often reflects population distribution rather than true spatial clustering. Consider using a rate or per-capita indicator.'
                    )}
                </NoticeBox>
            )}

            <div className={styles.flexColumnFlow}>
                <div className={styles.flexColumn}>
                    <SingleSelectField
                        label={i18n.t('Spatial analysis method')}
                        selected={method}
                        onChange={({ selected }) =>
                            handleMethodChange(selected)
                        }
                        dataTest="spatialanalysis-method"
                    >
                        {METHODS.map(({ value, label }) => (
                            <SingleSelectOption
                                key={value}
                                value={value}
                                label={label}
                            />
                        ))}
                    </SingleSelectField>

                    {isActive && (
                        <>
                            <SingleSelectField
                                label={i18n.t('Spatial weights')}
                                selected={weightSelectValue}
                                onChange={({ selected }) =>
                                    handleWeightTypeChange(selected)
                                }
                                dataTest="spatialanalysis-weights"
                            >
                                {WEIGHT_TYPES.map(({ value, label }) => (
                                    <SingleSelectOption
                                        key={value}
                                        value={value}
                                        label={label}
                                    />
                                ))}
                            </SingleSelectField>

                            {isDistanceBand && (
                                <InputField
                                    label={i18n.t(
                                        'Distance threshold (metres)'
                                    )}
                                    type="number"
                                    value={
                                        distanceMeters !== undefined
                                            ? String(distanceMeters)
                                            : ''
                                    }
                                    onChange={({ value }) =>
                                        update({
                                            distanceMeters: value
                                                ? Number(value)
                                                : undefined,
                                        })
                                    }
                                    dataTest="spatialanalysis-distance"
                                />
                            )}

                            {isKnn && (
                                <InputField
                                    label={i18n.t('Number of neighbours (k)')}
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={String(k)}
                                    onChange={({ value }) =>
                                        update({
                                            k: Math.max(
                                                1,
                                                Math.min(20, Number(value))
                                            ),
                                        })
                                    }
                                    dataTest="spatialanalysis-k"
                                />
                            )}

                            <SingleSelectField
                                label={i18n.t('Significance level (α)')}
                                selected={String(alpha)}
                                onChange={({ selected }) =>
                                    update({ alpha: Number(selected) })
                                }
                                dataTest="spatialanalysis-alpha"
                            >
                                {ALPHA_OPTIONS.map(({ value, label }) => (
                                    <SingleSelectOption
                                        key={value}
                                        value={value}
                                        label={label}
                                    />
                                ))}
                            </SingleSelectField>

                            <Button
                                small
                                secondary
                                onClick={() => setShowAdvanced((v) => !v)}
                                dataTest="spatialanalysis-advanced-toggle"
                            >
                                {showAdvanced
                                    ? i18n.t('Hide advanced options')
                                    : i18n.t('Show advanced options')}
                            </Button>

                            {showAdvanced && (
                                <div
                                    className={styles.flexColumnFlow}
                                    data-test="spatialanalysis-advanced"
                                >
                                    {isLisa && (
                                        <SingleSelectField
                                            label={i18n.t('Permutations')}
                                            selected={String(permutations)}
                                            onChange={({ selected }) =>
                                                update({
                                                    permutations:
                                                        Number(selected),
                                                })
                                            }
                                            dataTest="spatialanalysis-permutations"
                                        >
                                            {PERMUTATION_OPTIONS.map(
                                                ({ value, label }) => (
                                                    <SingleSelectOption
                                                        key={value}
                                                        value={value}
                                                        label={label}
                                                    />
                                                )
                                            )}
                                        </SingleSelectField>
                                    )}

                                    <SingleSelectField
                                        label={i18n.t(
                                            'Multiple-comparison correction'
                                        )}
                                        selected={correction}
                                        onChange={({ selected }) =>
                                            update({ correction: selected })
                                        }
                                        dataTest="spatialanalysis-correction"
                                    >
                                        {CORRECTION_OPTIONS.map(
                                            ({ value, label }) => (
                                                <SingleSelectOption
                                                    key={value}
                                                    value={value}
                                                    label={label}
                                                />
                                            )
                                        )}
                                    </SingleSelectField>

                                    {isLisa && (
                                        <SingleSelectField
                                            label={i18n.t('Quadrant scheme')}
                                            selected={quadrantScheme}
                                            onChange={({ selected }) =>
                                                update({
                                                    quadrantScheme: selected,
                                                })
                                            }
                                            dataTest="spatialanalysis-quadrant"
                                        >
                                            {QUADRANT_OPTIONS.map(
                                                ({ value, label }) => (
                                                    <SingleSelectOption
                                                        key={value}
                                                        value={value}
                                                        label={label}
                                                    />
                                                )
                                            )}
                                        </SingleSelectField>
                                    )}

                                    <Checkbox
                                        label={i18n.t(
                                            'Row-standardize weights'
                                        )}
                                        checked={rowStandardize}
                                        onChange={(checked) =>
                                            update({ rowStandardize: checked })
                                        }
                                        dataTest="spatialanalysis-rowstandardize"
                                    />

                                    <InputField
                                        label={i18n.t('Random seed')}
                                        type="number"
                                        value={
                                            seed !== undefined
                                                ? String(seed)
                                                : ''
                                        }
                                        onChange={({ value }) =>
                                            update({
                                                seed: value
                                                    ? Number(value)
                                                    : undefined,
                                            })
                                        }
                                        dataTest="spatialanalysis-seed"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

SpatialAnalysisSection.propTypes = {
    isCountLikeData: PropTypes.bool,
}

export default SpatialAnalysisSection
