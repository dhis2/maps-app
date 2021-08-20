import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Help } from '@dhis2/ui';
import ColorSymbolSelect from './ColorSymbolSelect';
import GroupStyle from './GroupStyle';
import { setOrganisationUnitGroupSetStyle } from '../../actions/layerEdit';
import { qualitativeColors } from '../../constants/colors';
import { getUniqueColor } from '../../util/colors';
import { apiFetch } from '../../util/api';

const getColor = getUniqueColor(qualitativeColors);

const parseGroupSet = response => {
    const groups = response.organisationUnitGroups;

    groups.sort((a, b) => a.name.localeCompare(b.name));

    return groups.map((group, index) =>
        group.color ? group : { ...group, color: getColor(index) }
    );
};

export const GroupSetStyle = ({
    groupSet,
    setOrganisationUnitGroupSetStyle,
}) => {
    const [styleType, setStyleType] = useState('color');
    const [error, setError] = useState();
    const { organisationUnitGroups: groups } = groupSet;

    const onGroupStyleChange = useCallback(
        (id, color) =>
            setOrganisationUnitGroupSetStyle(
                groups.map(group =>
                    group.id === id
                        ? {
                              ...group,
                              color,
                          }
                        : group
                )
            ),
        [groups, setOrganisationUnitGroupSetStyle]
    );

    useEffect(() => {
        if (!groupSet.organisationUnitGroups) {
            const url = `/organisationUnitGroupSets/${groupSet.id}?fields=organisationUnitGroups[id,name,color,symbol]`;

            apiFetch(url)
                .then(parseGroupSet)
                .then(setOrganisationUnitGroupSetStyle)
                .catch(() =>
                    setError(i18n.t('Failed to load organisation unit groups.'))
                );
        }
    }, [groupSet, setOrganisationUnitGroupSetStyle]);

    if (error) {
        return <Help error>{error}</Help>;
    }

    return groups ? (
        <>
            <ColorSymbolSelect styleType={styleType} onChange={setStyleType} />
            {groups.map(group => (
                <GroupStyle
                    key={group.id}
                    styleType={styleType}
                    onChange={color => onGroupStyleChange(group.id, color)}
                    {...group}
                />
            ))}
        </>
    ) : null;
};

GroupSetStyle.propTypes = {
    groupSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
        organisationUnitGroups: PropTypes.array,
    }),
    setOrganisationUnitGroupSetStyle: PropTypes.func.isRequired,
};

export default connect(null, { setOrganisationUnitGroupSetStyle })(
    GroupSetStyle
);
