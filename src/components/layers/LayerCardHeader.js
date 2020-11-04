import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Tooltip } from '@dhis2/ui';
import ExpandIcon from '@material-ui/icons/ExpandMore';
import CollapseIcon from '@material-ui/icons/ExpandLess';
import styles from './styles/LayerCardHeader.module.css';

// Wrapper around @dhis2/ui checkbox for unified handling and styling
const LayerCardHeader = ({ title, subtitle, isExpanded, toggleExpand }) => (
    <div className={styles.cardHeader}>
        <div className={styles.content}>
            <h2>{title}</h2>
            {subtitle && <h3>{subtitle}</h3>}
        </div>
        <div className={styles.action}>
            <Tooltip
                content={isExpanded ? i18n.t('Collapse') : i18n.t('Expand')}
            >
                <span className={styles.expand} onClick={toggleExpand}>
                    {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                </span>
            </Tooltip>
        </div>
    </div>
);

LayerCardHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    isExpanded: PropTypes.bool.isRequired,
    toggleExpand: PropTypes.func.isRequired,
};

export default LayerCardHeader;
