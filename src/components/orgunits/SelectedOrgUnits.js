import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import {
    getOrgUnitNodesFromRows,
    getUserOrgUnitsFromRows,
} from '../../util/analytics';

const styles = {
    container: {
        paddingTop: 24,
        lineHeight: '22px',
    },
    error: {
        color: 'red',
    },
};

const levels = {
    USER_ORGUNIT: i18n.t('user organisation unit'),
    USER_ORGUNIT_CHILDREN: i18n.t('right below user organisation unit'),
    USER_ORGUNIT_GRANDCHILDREN: i18n.t(
        'two levels below user organisation unit'
    ),
};

const modes = {
    SELECTED: i18n.t('in'),
    CHILDREN: i18n.t('in and right below'),
    DESCENDANTS: i18n.t('in and all below'),
};

const SelectedOrgUnits = ({ units, rows, mode = 'SELECTED', error }) => {
    const orgUnits = getOrgUnitNodesFromRows(rows)
        .map(ou => ou.displayName || ou.name)
        .sort();
    const userOrgUnits = getUserOrgUnitsFromRows(rows)
        .sort()
        .map(id => i18n.t(levels[id]));

    let selected = i18n.t('No organisation units are selected');

    if (orgUnits.length || userOrgUnits.length) {
        selected = `${units} ${modes[mode]} `;

        if (userOrgUnits.length) {
            selected += userOrgUnits.join(', ');
        } else {
            selected += orgUnits.join(', ');
        }
    }

    return (
        <div style={styles.container}>
            {error && !orgUnits.length && !userOrgUnits.length ? (
                <div style={styles.error}>{error}</div>
            ) : (
                <div>
                    <strong>{i18n.t('Selected organisation units')}</strong>
                    <br />
                    {selected}
                </div>
            )}
        </div>
    );
};

SelectedOrgUnits.propTypes = {
    mode: PropTypes.string,
    units: PropTypes.string,
    rows: PropTypes.array,
    error: PropTypes.object,
};

export default SelectedOrgUnits;
