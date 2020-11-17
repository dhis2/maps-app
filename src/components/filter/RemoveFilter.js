import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import DeleteIcon from '@material-ui/icons/Delete';
import { Tooltip } from '@dhis2/ui';
import styles from './styles/RemoveFilter.module.css';

// Remove filter button used for both thematic and event filters
const RemoveFilter = ({ onClick }) => (
    <div className={styles.removeBtnContainer} onClick={onClick}>
        <Tooltip content={i18n.t('Remove filter')}>
            <DeleteIcon />
        </Tooltip>
    </div>
);

RemoveFilter.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default RemoveFilter;
