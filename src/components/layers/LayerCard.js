import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Card, IconChevronUp24, IconChevronDown24 } from '@dhis2/ui';
import cx from 'classnames';
import { IconButton } from '../core';
import SortableHandle from './SortableHandle';
import LayerToolbar from './toolbar/LayerToolbar';
import styles from './styles/LayerCard.module.css';

const LayerCard = ({
    title,
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
    >
        <Card dataTest={isOverlay ? 'layercard' : 'basemapcard'}>
            <div className={styles.cardHeader}>
                <div
                    className={cx(styles.title, {
                        [styles.overlay]: isOverlay,
                    })}
                >
                    <h2>{title}</h2>
                    {subtitle && <h3>{subtitle}</h3>}
                </div>
                <div className={styles.action}>
                    {isOverlay && <SortableHandle />}
                    <IconButton
                        tooltip={
                            isExpanded ? i18n.t('Collapse') : i18n.t('Expand')
                        }
                        onClick={toggleExpand}
                        className={styles.expand}
                        dataTest="editbutton"
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
                <LayerToolbar {...layerToolbarProps} />
            </div>
        </Card>
    </div>
);

LayerCard.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    isOverlay: PropTypes.bool,
    isExpanded: PropTypes.bool.isRequired,
    toggleExpand: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
};

export default LayerCard;
