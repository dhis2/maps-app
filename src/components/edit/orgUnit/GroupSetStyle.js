import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { Help } from '@dhis2/ui';
import ColorSymbolSelect from './ColorSymbolSelect';
import GroupStyle from './GroupStyle';
import { qualitativeColors } from '../../../constants/colors';
import { getUniqueColor } from '../../../util/colors';
import { apiFetch } from '../../../util/api';

const getColor = getUniqueColor(qualitativeColors);

export const GroupSetStyle = ({ groupSet }) => {
    const [groups, setGroups] = useState([]);
    const [styleType, setStyleType] = useState('color');
    const [error, setError] = useState();

    useEffect(() => {
        const url = `/organisationUnitGroupSets/${groupSet.id}?fields=organisationUnitGroups[id,name,color,symbol]`;

        apiFetch(url)
            .then(response => {
                const groups = response.organisationUnitGroups;

                groups.sort((a, b) => a.name.localeCompare(b.name));

                setGroups(
                    groups.map((group, index) =>
                        group.color
                            ? group
                            : { ...group, color: getColor(index) }
                    )
                );
            })
            .catch(() =>
                setError(i18n.t('Failed to load organisation unit groups.'))
            );
    }, [groupSet]);

    if (error) {
        return <Help error>{error}</Help>;
    }

    return (
        <>
            <ColorSymbolSelect styleType={styleType} onChange={setStyleType} />
            {groups.map(group => (
                <GroupStyle key={group.id} styleType={styleType} {...group} />
            ))}
        </>
    );
};

GroupSetStyle.propTypes = {
    groupSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
};

export default GroupSetStyle;
