import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setOrganisationUnitGroupSet } from '../../actions/layerEdit.js'
import styles from '../edit/styles/LayerDialog.module.css'
import GroupSetSelect from './GroupSetSelect.jsx'
import GroupSetStyle from './GroupSetStyle.jsx'

const StyleByGroupSet = ({
    defaultStyleType,
    groupSet,
    setOrganisationUnitGroupSet,
}) => {
    return (
        <div>
            <GroupSetSelect
                label={i18n.t('Style by group set')}
                value={groupSet}
                allowNone={true}
                onChange={setOrganisationUnitGroupSet}
                className={styles.select}
            />
            {groupSet && (
                <GroupSetStyle
                    defaultStyleType={defaultStyleType}
                    groupSet={groupSet}
                />
            )}
        </div>
    )
}

StyleByGroupSet.propTypes = {
    setOrganisationUnitGroupSet: PropTypes.func.isRequired,
    defaultStyleType: PropTypes.string,
    groupSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default connect(
    ({ layerEdit }) => ({
        groupSet: layerEdit.organisationUnitGroupSet,
    }),
    { setOrganisationUnitGroupSet }
)(StyleByGroupSet)
