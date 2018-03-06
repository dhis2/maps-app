import React from 'react';
import i18next from 'i18next';
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
    USER_ORGUNIT: 'user organisation unit',
    USER_ORGUNIT_CHILDREN: 'right below user organisation unit',
    USER_ORGUNIT_GRANDCHILDREN: 'two levels below user organisation unit',
};

const SelectedOrgUnits = ({ units, rows, error }) => {
    const orgUnits = getOrgUnitNodesFromRows(rows)
        .map(ou => ou.displayName)
        .sort();
    const userOrgUnits = getUserOrgUnitsFromRows(rows)
        .sort()
        .map(id => i18next.t(levels[id]));

    let selected = i18next.t('No organisation units are selected');

    if (orgUnits.length || userOrgUnits.length) {
        selected = `${units} ${i18next.t('in')} `;

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
                    <strong>Selected organisation units</strong>
                    <br />
                    {selected}
                </div>
            )}
        </div>
    );
};

export default SelectedOrgUnits;
