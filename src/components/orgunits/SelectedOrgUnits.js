import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import {
    getOrgUnitNodesFromRows,
    getUserOrgUnitsFromRows,
} from '../../util/analytics.js'

const styles = {
    container: {
        paddingTop: 24,
        lineHeight: '22px',
    },
    error: {
        color: 'red',
    },
}

const getLevels = () => ({
    USER_ORGUNIT: i18n.t('user organisation unit'),
    USER_ORGUNIT_CHILDREN: i18n.t('right below user organisation unit'),
    USER_ORGUNIT_GRANDCHILDREN: i18n.t(
        'two levels below user organisation unit'
    ),
})

const getModeString = (props) => ({
    SELECTED: i18n.t('{{units}} in {{orgunits}}', props),
    CHILDREN: i18n.t('{{units}} in and right below {{orgunits}}', props),
    DESCENDANTS: i18n.t('{{units}} in and all below {{orgunits}}', props),
})

const SelectedOrgUnits = ({ units, rows, mode = 'SELECTED', error }) => {
    const orgUnits = getOrgUnitNodesFromRows(rows)
        .map((ou) => ou.displayName || ou.name)
        .sort()
    const userOrgUnits = getUserOrgUnitsFromRows(rows)
        .sort()
        .map((id) => getLevels()[id])

    let selected = i18n.t('No organisation units are selected')

    if (orgUnits.length || userOrgUnits.length) {
        selected = getModeString({
            orgunits: userOrgUnits.length
                ? userOrgUnits.join(', ')
                : orgUnits.join(', '),
            units,
        })[mode]
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
    )
}

SelectedOrgUnits.propTypes = {
    error: PropTypes.string,
    mode: PropTypes.string,
    rows: PropTypes.array,
    units: PropTypes.string,
}

export default SelectedOrgUnits
