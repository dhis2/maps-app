import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React, { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setOrgUnitMode } from '../../actions/layerEdit.js'
import {
    ORG_UNIT_MODE_CHILDREN,
    ORG_UNIT_MODE_DESCENDANTS,
    ORG_UNIT_MODE_SELECTED,
} from '../../constants/orgUnits.js'
import { getTrackedEntityDefaultOrgUnitMode } from '../../util/trackedEntity.js'
import { SelectField } from '../core/index.js'
import styles from './styles/OrgUnitSelectMode.module.css'

const OrgUnitSelectMode = () => {
    const organisationUnitSelectionMode = useSelector(
        (state) => state.layerEdit.organisationUnitSelectionMode
    )
    const { serverVersion } = useConfig()
    const dispatch = useDispatch()

    const items = useMemo(
        () => [
            {
                id: ORG_UNIT_MODE_SELECTED,
                name: i18n.t('Selected only'),
            },
            {
                id: ORG_UNIT_MODE_CHILDREN,
                name: i18n.t('Immediate children'),
            },
            {
                id: ORG_UNIT_MODE_DESCENDANTS,
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
                value={
                    organisationUnitSelectionMode ||
                    getTrackedEntityDefaultOrgUnitMode(serverVersion)
                }
                onChange={(mode) => dispatch(setOrgUnitMode(mode.id))}
                className={styles.selectField}
            />
        </div>
    )
}

OrgUnitSelectMode.propTypes = {}

export default OrgUnitSelectMode
