import { IconEdit16, IconDelete16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import styles from './styles/LayerSourceCard.module.css'

const LayerSourceCard = ({
    source,
    isFavorite,
    onToggleFavorite,
    onAddToMap,
    onEdit,
    onDelete,
}) => {
    const [expanded, setExpanded] = useState(false)

    const {
        name,
        description,
        extendedDescription,
        img,
        origin,
        periodType,
        resolution,
        tags,
        periodCovered,
        spatialResolution,
        providerUrl,
        license,
    } = source

    const metaParts = [periodType, resolution].filter(Boolean)
    const hasDetails =
        extendedDescription ||
        periodCovered ||
        spatialResolution ||
        providerUrl ||
        license

    return (
        <div
            className={`${styles.card}${
                expanded ? ` ${styles.cardExpanded}` : ''
            }`}
            onClick={() => setExpanded((e) => !e)}
        >
            <img src={img} className={styles.thumbnail} alt="" />
            <div className={styles.body}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <p className={styles.name}>{name}</p>
                        <p className={styles.subtitle}>{origin}</p>
                    </div>
                    <div className={styles.actions}>
                        <button
                            className={`${styles.starButton}${
                                isFavorite ? ` ${styles.favorited}` : ''
                            }`}
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleFavorite(source.id)
                            }}
                            title={
                                isFavorite
                                    ? 'Remove from favorites'
                                    : 'Add to favorites'
                            }
                        >
                            {isFavorite ? '★' : '☆'}
                        </button>
                        {onEdit && (
                            <button
                                className={styles.iconButton}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(source)
                                }}
                                title="Edit source"
                            >
                                <IconEdit16 />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                className={`${styles.iconButton} ${styles.deleteIconButton}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(source.id)
                                }}
                                title="Delete source"
                            >
                                <IconDelete16 />
                            </button>
                        )}
                        <button
                            className={styles.addToMapButton}
                            onClick={(e) => {
                                e.stopPropagation()
                                onAddToMap(source)
                            }}
                        >
                            + Add to map
                        </button>
                    </div>
                </div>
                <p className={styles.description}>{description}</p>
                <div className={styles.footer}>
                    {tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                            {tag}
                        </span>
                    ))}
                    {metaParts.length > 0 && (
                        <span className={styles.meta}>
                            {metaParts.join(' · ')}
                        </span>
                    )}
                    {hasDetails && (
                        <span className={styles.expandHint}>
                            {expanded ? '▴' : '▾'}
                        </span>
                    )}
                </div>
                {expanded && hasDetails && (
                    <div className={styles.details}>
                        {extendedDescription && (
                            <p className={styles.extendedDescription}>
                                {extendedDescription}
                            </p>
                        )}
                        <div className={styles.detailGrid}>
                            {periodCovered && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>
                                        Period
                                    </span>
                                    <span className={styles.detailValue}>
                                        {periodCovered}
                                    </span>
                                </div>
                            )}
                            {spatialResolution && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>
                                        Spatial res.
                                    </span>
                                    <span className={styles.detailValue}>
                                        {spatialResolution}
                                    </span>
                                </div>
                            )}
                            {license && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>
                                        License
                                    </span>
                                    <span className={styles.detailValue}>
                                        {license}
                                    </span>
                                </div>
                            )}
                            {providerUrl && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>
                                        Provider
                                    </span>
                                    <a
                                        href={providerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.detailLink}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Visit website ↗
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

LayerSourceCard.propTypes = {
    isFavorite: PropTypes.bool.isRequired,
    source: PropTypes.shape({
        description: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        img: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        origin: PropTypes.string.isRequired,
        tags: PropTypes.arrayOf(PropTypes.string).isRequired,
        extendedDescription: PropTypes.string,
        license: PropTypes.string,
        periodCovered: PropTypes.string,
        periodType: PropTypes.string,
        providerUrl: PropTypes.string,
        resolution: PropTypes.string,
        spatialResolution: PropTypes.string,
    }).isRequired,
    onAddToMap: PropTypes.func.isRequired,
    onToggleFavorite: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
}

export default LayerSourceCard
