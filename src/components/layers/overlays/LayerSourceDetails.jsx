import i18n from '@dhis2/d2-i18n'
import { Button, IconCross16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useLayoutEffect, useRef, useState } from 'react'
import {
    getLayerSourceLabel,
    getLayerSourceDescription,
    getLayerSourceMeta,
    getLayerSourceKind,
    getLayerSourceKindLabel,
    getLayerSourcePlacement,
    getLayerSourcePlacementLabel,
    PLACEMENT_BASEMAP,
} from '../../../util/layerSources.js'
import styles from './styles/LayerSourceDetails.module.css'

// Grouped Earth Engine entries hold their datasets one or two levels down -
// list them so the group is more than an opaque name
const getContainedLayerNames = (entry) =>
    (entry?.items ?? [])
        .flatMap((sub) =>
            sub?.items
                ? sub.items.map(getLayerSourceLabel)
                : [getLayerSourceLabel(sub)]
        )
        .filter(Boolean)

// Distance the panel keeps from the bottom of the window
const VIEWPORT_MARGIN = 8

const LayerSourceDetails = ({ layer, top, onClose, onSelect }) => {
    const ref = useRef(null)
    // The caller lines the panel up with the info button it came from; only
    // once it has rendered do we know how tall it is, so nudge it back up if
    // that alignment pushes it past the bottom of the window
    const [offsetTop, setOffsetTop] = useState(top)

    useLayoutEffect(() => {
        const { bottom } = ref.current?.getBoundingClientRect() ?? {}
        const overflow = bottom - (window.innerHeight - VIEWPORT_MARGIN)
        if (overflow > 0) {
            setOffsetTop(Math.max(0, top - overflow))
        }
    }, [top])

    const label = getLayerSourceLabel(layer)
    const description = getLayerSourceDescription(layer)
    const meta = getLayerSourceMeta(layer)
    const kind = getLayerSourceKind(layer)
    const placement = getLayerSourcePlacement(layer)
    const contained = getContainedLayerNames(layer)

    return (
        <div
            ref={ref}
            className={styles.panel}
            style={{ top: offsetTop }}
            data-test="addlayerinfopanel"
            onClick={(event) => event.stopPropagation()}
        >
            <button
                type="button"
                className={styles.close}
                title={i18n.t('Close')}
                onClick={onClose}
                data-test="addlayerinfopanel-close"
            >
                <IconCross16 />
            </button>
            {layer.img ? (
                <img src={layer.img} className={styles.thumb} alt="" />
            ) : (
                <div className={styles.noThumb}>
                    {i18n.t('No preview available')}
                </div>
            )}
            <div className={styles.name}>{label}</div>
            <div className={styles.pills}>
                <span className={styles.pill}>
                    {getLayerSourceKindLabel(kind)}
                </span>
                {placement === PLACEMENT_BASEMAP && (
                    <span className={styles.pill}>
                        {getLayerSourcePlacementLabel(placement)}
                    </span>
                )}
            </div>
            {description ? (
                <div className={styles.description}>{description}</div>
            ) : (
                <div className={styles.noDescription}>
                    {i18n.t('No description provided.')}
                </div>
            )}
            {meta.length > 0 && (
                <dl className={styles.meta}>
                    {meta.map(({ label: metaLabel, value }) => (
                        <React.Fragment key={metaLabel}>
                            <dt className={styles.metaLabel}>{metaLabel}</dt>
                            <dd className={styles.metaValue}>{value}</dd>
                        </React.Fragment>
                    ))}
                </dl>
            )}
            {contained.length > 0 && (
                <div className={styles.contained}>
                    <div className={styles.containedLabel}>
                        {i18n.t('Includes {{count}} datasets', {
                            count: contained.length,
                        })}
                    </div>
                    <ul className={styles.containedList}>
                        {contained.map((name) => (
                            <li key={name}>{name}</li>
                        ))}
                    </ul>
                </div>
            )}
            {onSelect && (
                <div className={styles.actions}>
                    <Button
                        small
                        secondary
                        onClick={() => onSelect(layer)}
                        dataTest="addlayerinfopanel-add"
                    >
                        {i18n.t('Add to map')}
                    </Button>
                </div>
            )}
        </div>
    )
}

LayerSourceDetails.propTypes = {
    layer: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    top: PropTypes.number,
    onSelect: PropTypes.func,
}

export default LayerSourceDetails
