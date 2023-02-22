import i18n from '@dhis2/d2-i18n'
import React, { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setOrgUnitMode } from '../../actions/layerEdit.js'
import { SelectField } from '../core/index.js'
import styles from './styles/OrgUnitSelectMode.module.css'

const OrgUnitSelectMode = () => {
    const organisationUnitSelectionMode = useSelector(
        (state) => state.layerEdit.organisationUnitSelectionMode
    )
    const dispatch = useDispatch()

    const items = useMemo(
        () => [
            {
                id: 'SELECTED',
                name: i18n.t('Selected only'),
            },
            {
                id: 'CHILDREN',
                name: i18n.t('Selected and below'),
            },
            {
                id: 'DESCENDANTS',
                name: i18n.t('Selected and all below'),
            },
        ],
        []
    )

    return (
        <div className={styles.orgUnitSelectMode}>
            <SelectField
                prefix={i18n.t('Selection mode')}
                items={items}
                value={organisationUnitSelectionMode || 'SELECTED'}
                onChange={(mode) => dispatch(setOrgUnitMode(mode.id))}
                className={styles.selectField}
            />
        </div>
    )
}

OrgUnitSelectMode.propTypes = {}

export default OrgUnitSelectMode
