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
    layer,
    title,
    subtitle,
    opacity,
    isOverlay,
    isExpanded,
    isVisible,
    onOpacityChange,
    onEdit,
    onRemove,
    downloadData,
    openAs,
    toggleDataTable,
    toggleExpand,
    toggleLayerVisibility,
    children,
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
                <LayerToolbar
                    layer={layer}
                    opacity={opacity}
                    isVisible={isVisible}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    onOpacityChange={onOpacityChange}
                    downloadData={downloadData}
                    openAs={openAs}
                    toggleDataTable={toggleDataTable}
                    toggleLayerVisibility={toggleLayerVisibility}
                />
            </div>
        </Card>
    </div>
);

LayerCard.propTypes = {
    layer: PropTypes.object,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    opacity: PropTypes.number,
    isOverlay: PropTypes.bool,
    isExpanded: PropTypes.bool.isRequired,
    isVisible: PropTypes.bool,
    onOpacityChange: PropTypes.func.isRequired,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func,
    downloadData: PropTypes.func,
    openAs: PropTypes.func,
    toggleDataTable: PropTypes.func,
    toggleExpand: PropTypes.func.isRequired,
    toggleLayerVisibility: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
};

export default LayerCard;
