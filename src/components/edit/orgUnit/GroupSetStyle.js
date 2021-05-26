import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { apiFetch } from '../../../util/api';
// import styles from '../styles/LayerDialog.module.css';

export const GroupSetStyle = ({ groupSet }) => {
    const [groups, setGroups] = useState();
    const [error, setError] = useState();

    useEffect(() => {
        const url = `/organisationUnitGroupSets/${groupSet.id}?fields=organisationUnitGroups[id,name,color,symbol]`;

        apiFetch(url)
            .then(response => setGroups(response.organisationUnitGroups))
            .catch(() =>
                setError(i18n.t('Failed to load organisation unit groups.'))
            );
    }, [groupSet]);

    return (
        <div>
            Group set style {groups} {error}
        </div>
    );
};

GroupSetStyle.propTypes = {
    groupSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
};

export default GroupSetStyle;
