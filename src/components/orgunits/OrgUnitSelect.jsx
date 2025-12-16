import { OrgUnitDimension } from '@dhis2/analytics'
import { CenteredContent, CircularLoader, Help } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setOrgUnits } from '../../actions/layerEdit.js'
import { translateOrgUnitLevels } from '../../util/orgUnits.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { useOrgUnits } from '../OrgUnitsProvider.jsx'
import AssociatedGeometrySelect from './AssociatedGeometrySelect.jsx'
import OrgUnitSelectMode from './OrgUnitSelectMode.jsx'
import styles from './styles/OrgUnitSelect.module.css'

const TWO_OTHER_SELECTS = 'two'
const ONE_OTHER_SELECT = 'one'
const NO_OTHER_SELECTS = 'none'

const OrgUnitSelect = ({
    hideUserOrgUnits = false,
    hideAssociatedGeometry = false,
    hideSelectMode = true,
    hideLevelSelect = false,
    hideGroupSelect = false,
    warning,
}) => {
    const { nameProperty } = useCachedData()
    const { roots, levels, loading, error } = useOrgUnits()
    const rows = useSelector((state) => state.layerEdit.rows)
    const dispatch = useDispatch()

    const setOrgUnitItems = useCallback(
        ({ items }) =>
            dispatch(
                setOrgUnits({
                    dimension: 'ou',
                    items,
                })
            ),
        [dispatch]
    )

    const orgUnits = translateOrgUnitLevels(
        rows?.find((r) => r.dimension === 'ou'),
        levels
    )
    const hasOrgUnits = !!orgUnits.length

    if (error?.message) {
        return (
            <div className={styles.orgUnitSelect}>
                <Help error>{error.message}</Help>
            </div>
        )
    } else if (loading) {
        return (
            <div className={styles.loader}>
                <CenteredContent>
                    <CircularLoader />
                </CenteredContent>
            </div>
        )
    }

    const numOtherSelects =
        !hideAssociatedGeometry && !hideSelectMode
            ? TWO_OTHER_SELECTS
            : !hideAssociatedGeometry || !hideSelectMode
            ? ONE_OTHER_SELECT
            : NO_OTHER_SELECTS

    return (
        <div className={styles.orgUnitSelect} data-test="org-unit-select">
            <div
                className={cx({
                    [styles.two]: numOtherSelects === TWO_OTHER_SELECTS,
                    [styles.one]: numOtherSelects === ONE_OTHER_SELECT,
                    [styles.none]: numOtherSelects === NO_OTHER_SELECTS,
                })}
            >
                <OrgUnitDimension
                    roots={roots?.map((r) => r.id)}
                    selected={orgUnits}
                    onSelect={setOrgUnitItems}
                    hideUserOrgUnits={hideUserOrgUnits}
                    hideLevelSelect={hideLevelSelect}
                    hideGroupSelect={hideGroupSelect}
                    warning={!hasOrgUnits ? warning : null}
                    displayNameProp={nameProperty}
                />
            </div>
            {!hideAssociatedGeometry && <AssociatedGeometrySelect />}
            {!hideSelectMode && <OrgUnitSelectMode />}
        </div>
    )
}

OrgUnitSelect.propTypes = {
    hideAssociatedGeometry: PropTypes.bool,
    hideGroupSelect: PropTypes.bool,
    hideLevelSelect: PropTypes.bool,
    hideSelectMode: PropTypes.bool,
    hideUserOrgUnits: PropTypes.bool,
    warning: PropTypes.string,
}

export default OrgUnitSelect
