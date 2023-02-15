import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setOrganisationUnitField } from '../../actions/layerEdit.js'
import { NONE } from '../../constants/layers.js'
import { SelectField } from '../core/index.js'
import styles from './styles/OrgUnitFieldSelect.module.css'

const OrgUnitFieldSelect = () => {
    const orgUnitField = useSelector((state) => state.layerEdit.orgUnitField)
    const [attributes, setAttributes] = useState([])
    const dispatch = useDispatch()
    const engine = useDataEngine()

    useEffect(() => {
        async function fetchData() {
            const { fetchedAttributes } = await engine.query({
                fetchedAttributes: {
                    resource:
                        '/attributes.json?fields=id,name,description&filter=valueType:eq:GEOJSON&filter=organisationUnitAttribute:eq:true',
                },
            })

            setAttributes(fetchedAttributes.attributes)
        }
        fetchData()
    }, [engine])

    if (!attributes.length) {
        return null
    }

    const attribute = attributes.find((a) => a.id === orgUnitField)

    return (
        <div className={styles.orgUnitField}>
            <SelectField
                prefix={i18n.t('Use associated geometry')}
                items={[{ id: NONE, name: i18n.t('None') }, ...attributes]}
                value={orgUnitField}
                onChange={(val) => dispatch(setOrganisationUnitField(val))}
                data-test="orgunitfieldselect"
            />
            {attribute && attribute.description && (
                <div className={styles.orgUnitFieldDescription}>
                    {attribute.description}
                </div>
            )}
        </div>
    )
}

export default OrgUnitFieldSelect
