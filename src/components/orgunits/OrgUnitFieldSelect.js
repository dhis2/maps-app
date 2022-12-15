import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { setOrganisationUnitField } from '../../actions/layerEdit.js'
import { NONE } from '../../constants/layers.js'
import { fetchOrgUnitFields } from '../../util/orgUnits.js'
import { SelectField } from '../core/index.js'
import styles from './styles/OrgUnitFieldSelect.module.css'

const OrgUnitFieldSelect = ({ orgUnitField, setOrganisationUnitField }) => {
    const [attributes, setAttributes] = useState([])

    useEffect(() => {
        fetchOrgUnitFields().then(setAttributes)
    }, [])

    if (!attributes.length) {
        return null
    }

    const attribute = attributes.find((a) => a.id === orgUnitField)

    return (
        <>
            <SelectField
                label={i18n.t('Use associated geometry')}
                items={[{ id: NONE, name: i18n.t('None') }, ...attributes]}
                value={orgUnitField}
                onChange={setOrganisationUnitField}
                data-test="orgunitfieldselect"
            />
            {attribute && attribute.description && (
                <div className={styles.orgUnitFieldDescription}>
                    {attribute.description}
                </div>
            )}
        </>
    )
}

OrgUnitFieldSelect.propTypes = {
    setOrganisationUnitField: PropTypes.func.isRequired,
    orgUnitField: PropTypes.string,
}

export default connect(
    ({ layerEdit }) => ({
        orgUnitField: layerEdit.orgUnitField,
    }),
    { setOrganisationUnitField }
)(OrgUnitFieldSelect)
