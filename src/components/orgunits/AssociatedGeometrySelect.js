import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setOrganisationUnitField } from '../../actions/layerEdit.js'
import { NONE } from '../../constants/layers.js'
import { SelectField } from '../core/index.js'
import styles from './styles/AssociatedGeometrySelect.module.css'

const AssociatedGeometrySelect = () => {
    const geometryField = useSelector((state) => state.layerEdit.orgUnitField)
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

    const attribute = attributes.find((a) => a.id === geometryField)

    return (
        <div className={styles.geometryField}>
            <SelectField
                prefix={i18n.t('Use associated geometry')}
                items={[
                    { id: NONE, name: i18n.t('None (default)') },
                    ...attributes,
                ]}
                value={geometryField || NONE}
                onChange={(val) => dispatch(setOrganisationUnitField(val))}
                data-test="orgunitfieldselect"
            />
            {attribute?.description && (
                <div className={styles.geometryDescription}>
                    {attribute.description}
                </div>
            )}
        </div>
    )
}

export default AssociatedGeometrySelect
