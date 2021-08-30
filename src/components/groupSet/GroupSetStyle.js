import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Help } from '@dhis2/ui';
import GroupStyle from './GroupStyle';
import { fetchOrgUnitGroupSet } from '../../util/orgUnits';
import { STYLE_TYPE_COLOR } from '../../constants/layers';

export const GroupSetStyle = ({
    defaultStyleType = STYLE_TYPE_COLOR,
    groupSet,
}) => {
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState();

    useEffect(() => {
        fetchOrgUnitGroupSet(groupSet.id)
            .then(setGroups)
            .catch(() =>
                setError(i18n.t('Failed to load organisation unit groups.'))
            );
    }, [groupSet]);

    if (error) {
        return <Help error>{error}</Help>;
    }

    return groups.map(group => (
        <GroupStyle key={group.id} styleType={defaultStyleType} {...group} />
    ));
};

GroupSetStyle.propTypes = {
    defaultStyleType: PropTypes.string,
    groupSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
};

export default GroupSetStyle;
