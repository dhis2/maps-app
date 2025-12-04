import i18n from '@dhis2/d2-i18n'
import { Card, IconChevronUp24, IconChevronDown24 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import {
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../constants/layers.js'
import { IconButton } from '../core/index.js'
import SortableHandle from './SortableHandle.jsx'
import styles from './styles/LayerCard.module.css'
import LayerToolbar from './toolbar/LayerToolbar.jsx'

const getRenderingLabel = (strategy) => {
    const map = {
        [RENDERING_STRATEGY_SPLIT_BY_PERIOD]: i18n.t('Split'),
        [RENDERING_STRATEGY_TIMELINE]: i18n.t('Timeline'),
    }
    return map[strategy] ? ' • ' + map[strategy] : null
}

const LayerCard = ({
    layer,
    title = '',
    subtitle,
    isOverlay,
    isExpanded,
    toggleExpand,
    children,
    ...layerToolbarProps
}) => (
    <div
        className={cx(styles.card, {
            [styles.expanded]: isExpanded,
        })}
        data-test={`card-${title.replace(/ /g, '')}`}
    >
        <Card dataTest={isOverlay ? 'layercard' : 'basemapcard'}>
            <div className={styles.cardHeader}>
                <div
                    className={cx(styles.title, {
                        [styles.overlay]: isOverlay,
                    })}
                >
                    <h2>{title}</h2>
                    {subtitle && (
                        <h3>
                            {subtitle}
                            {getRenderingLabel(layer?.renderingStrategy)}
                        </h3>
                    )}
                </div>
                <div className={styles.action}>
                    {isOverlay && <SortableHandle />}
                    <IconButton
                        tooltip={
                            isExpanded ? i18n.t('Collapse') : i18n.t('Expand')
                        }
                        onClick={toggleExpand}
                        className={styles.expand}
                    >
                        {isExpanded ? (
                            <IconChevronUp24 />
                        ) : (
                            <IconChevronDown24 />
                        )}
                    </IconButton>
                </div>
            </div>
            <div className={styles.collapsibleContent}>
                <div className={styles.content}>{children}</div>
                <LayerToolbar layer={layer} {...layerToolbarProps} />
            </div>
        </Card>
    </div>
)

LayerCard.propTypes = {
    isExpanded: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    toggleExpand: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
    isOverlay: PropTypes.bool,
    layer: PropTypes.object,
    subtitle: PropTypes.string,
}

export default LayerCard
