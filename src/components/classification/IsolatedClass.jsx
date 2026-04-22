import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setLegendIsolated } from '../../actions/layerEdit.js'
import { NO_DATA_COLOR } from '../../constants/layers.js'
import { Checkbox, ColorPicker, NumberField, TextField } from '../core/index.js'
import styles from './styles/Classification.module.css'

const IsolatedClass = ({ legendIsolated, setLegendIsolated }) => (
    <>
        <Checkbox
            label={i18n.t('Isolated class')}
            checked={legendIsolated !== undefined}
            onChange={(checked) =>
                setLegendIsolated(
                    checked
                        ? { min: 0, max: 0, color: NO_DATA_COLOR }
                        : undefined
                )
            }
        />
        {legendIsolated !== undefined && (
            <div className={styles.isolatedRows}>
                <div className={styles.isolatedRow}>
                    <NumberField
                        label={i18n.t('Min')}
                        value={legendIsolated.min}
                        onChange={(min) =>
                            setLegendIsolated({ ...legendIsolated, min })
                        }
                        className={styles.isolatedField}
                    />
                    <NumberField
                        label={i18n.t('Max')}
                        value={legendIsolated.max}
                        onChange={(max) =>
                            setLegendIsolated({ ...legendIsolated, max })
                        }
                        className={styles.isolatedField}
                    />
                </div>
                <div className={styles.isolatedRow}>
                    <ColorPicker
                        label={i18n.t('Color')}
                        color={legendIsolated.color || NO_DATA_COLOR}
                        onChange={(color) =>
                            setLegendIsolated({ ...legendIsolated, color })
                        }
                        width={50}
                        className={styles.isolatedColor}
                    />
                    <TextField
                        label={i18n.t('Name')}
                        value={legendIsolated.name || ''}
                        placeholder={`${
                            legendIsolated.min ?? i18n.t('Min')
                        } - ${legendIsolated.max ?? i18n.t('Max')}`}
                        onChange={(name) =>
                            setLegendIsolated({
                                ...legendIsolated,
                                name: name || undefined,
                            })
                        }
                        className={styles.isolatedName}
                    />
                </div>
            </div>
        )}
    </>
)

IsolatedClass.propTypes = {
    setLegendIsolated: PropTypes.func.isRequired,
    legendIsolated: PropTypes.shape({
        color: PropTypes.string,
        max: PropTypes.number,
        min: PropTypes.number,
        name: PropTypes.string,
    }),
}

export default connect(
    ({ layerEdit }) => ({ legendIsolated: layerEdit.legendIsolated }),
    { setLegendIsolated }
)(IsolatedClass)
