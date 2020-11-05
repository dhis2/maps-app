import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Card, Tooltip } from '@dhis2/ui';
import cx from 'classnames';
import { Collapse } from '@material-ui/core';
import ExpandIcon from '@material-ui/icons/ExpandMore';
import CollapseIcon from '@material-ui/icons/ExpandLess';
import SortableHandle from './SortableHandle';
import LayerToolbar from './toolbar/LayerToolbar';
import styles from './styles/LayerCard.module.css';

const LayerCard = ({
    title,
    subtitle,
    opacity,
    isSortable,
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
    <div className={styles.card}>
        <Card dataTest="basemapcard">
            <div className={styles.cardHeader}>
                <div
                    className={cx(styles.title, {
                        [styles.sortable]: isSortable,
                    })}
                >
                    <h2>{title}</h2>
                    {subtitle && <h3>{subtitle}</h3>}
                </div>
                <div className={styles.action}>
                    {isSortable && <SortableHandle />}
                    <Tooltip
                        content={
                            isExpanded ? i18n.t('Collapse') : i18n.t('Expand')
                        }
                    >
                        <span className={styles.expand} onClick={toggleExpand}>
                            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                        </span>
                    </Tooltip>
                </div>
            </div>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <div className={styles.content}>{children}</div>
                <LayerToolbar
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
            </Collapse>
        </Card>
    </div>
);

LayerCard.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    opacity: PropTypes.number,
    isSortable: PropTypes.bool,
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
