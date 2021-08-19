import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Help } from '@dhis2/ui';
import ColorSymbolSelect from './ColorSymbolSelect';
import GroupStyle from './GroupStyle';
import { setGroupSetStyle } from '../../actions/layerEdit';
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
    groupSetStyle,
    setGroupSetStyle,
}) => {
    const [groups, setGroups] = useState([]);
    const [styleType, setStyleType] = useState('color');
    const [error, setError] = useState();

    const onGroupStyleChange = useCallback(
        (id, color) => {
            console.log('onGroupStyleChange', id, color, groupSetStyle);
        },
        [groupSetStyle, setGroupSetStyle]
    );

    useEffect(() => {
        const url = `/organisationUnitGroupSets/${groupSet.id}?fields=organisationUnitGroups[id,name,color,symbol]`;

        apiFetch(url)
            .then(response => setGroups(parseGroupSet(response)))
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
                <GroupStyle
                    key={group.id}
                    styleType={styleType}
                    onChange={color => onGroupStyleChange(group.id, color)}
                    {...group}
                />
            ))}
        </>
    );
};

GroupSetStyle.propTypes = {
    groupSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    groupSetStyle: PropTypes.object, // TODO
    setGroupSetStyle: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        groupSetStyle: layerEdit.styleDataItem,
    }),
    { setGroupSetStyle }
)(GroupSetStyle);
