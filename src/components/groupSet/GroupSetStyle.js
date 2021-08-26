import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Help } from '@dhis2/ui';
import StyleTypeSelect from './StyleTypeSelect';
import GroupStyle from './GroupStyle';
import {
    setOrganisationUnitGroupSetStyleType,
    setOrganisationUnitGroupSetStyle,
} from '../../actions/layerEdit';
import { fetchOrgUnitGroupSet } from '../../util/orgUnits';
import { STYLE_TYPE_COLOR } from '../../constants/layers';

export const GroupSetStyle = ({
    defaultStyleType = STYLE_TYPE_COLOR,
    groupSet,
    setOrganisationUnitGroupSetStyleType,
    setOrganisationUnitGroupSetStyle,
}) => {
    const [error, setError] = useState();
    const {
        styleType = defaultStyleType,
        organisationUnitGroups: groups,
    } = groupSet;

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
            fetchOrgUnitGroupSet(groupSet.id)
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
            <StyleTypeSelect
                styleType={styleType}
                onChange={setOrganisationUnitGroupSetStyleType}
            />
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
    defaultStyleType: PropTypes.string,
    groupSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
        styleType: PropTypes.string,
        organisationUnitGroups: PropTypes.array,
    }),
    setOrganisationUnitGroupSetStyleType: PropTypes.func.isRequired,
    setOrganisationUnitGroupSetStyle: PropTypes.func.isRequired,
};

export default connect(null, {
    setOrganisationUnitGroupSetStyleType,
    setOrganisationUnitGroupSetStyle,
})(GroupSetStyle);
