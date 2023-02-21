import { OrgUnitDimension } from '@dhis2/analytics'
import { useDataQuery } from '@dhis2/app-runtime'
import { CenteredContent, CircularLoader, Help } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setOrgUnits } from '../../actions/layerEdit.js'
import { DEFAULT_ORG_UNIT_LEVEL } from '../../constants/layers.js'
import { translateOrgUnitLevels } from '../../util/orgUnits.js'
import AssociatedGeometrySelect from './AssociatedGeometrySelect.js'
import OrgUnitSelectMode from './OrgUnitSelectMode.js'
import styles from './styles/OrgUnitSelect.module.css'

// Fetches the root org units associated with the current user with fallback to data capture org units
const ORG_UNIT_TREE_QUERY = {
    tree: {
        resource: 'organisationUnits',
        params: () => ({
            fields: ['id', 'displayName~rename(name)', 'path'],
            userDataViewFallback: true,
        }),
    },
    levels: {
        resource: 'organisationUnitLevels',
        params: {
            fields: ['id', 'displayName~rename(name)', 'level'],
            order: 'level:asc',
            paging: false,
        },
    },
}

const TWO_OTHER_SELECTS = 'two'
const ONE_OTHER_SELECT = 'one'
const NO_OTHER_SELECTS = 'none'

const OrgUnitSelect = ({
    hideUserOrgUnits = false,
    hideAssociatedGeometry = false,
    hideSelectMode = true,
    hideLevelSelect = false,
    hideGroupSelect = false,
    selectDefaultLevel = false,
    selectRoots = false,
    warning,
}) => {
    const { loading, data, error } = useDataQuery(ORG_UNIT_TREE_QUERY)
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

    const roots = data?.tree.organisationUnits
    const orgUnitLevels = data?.levels.organisationUnitLevels
    const defaultLevel = orgUnitLevels?.[DEFAULT_ORG_UNIT_LEVEL]

    const orgUnits = translateOrgUnitLevels(
        rows?.find((r) => r.dimension === 'ou'),
        orgUnitLevels
    )
    const hasOrgUnits = !!orgUnits.length

    useEffect(() => {
        if (!rows && !hasOrgUnits && selectRoots && roots) {
            setOrgUnitItems({
                items: roots,
            })
        }
    }, [rows, selectRoots, roots, hasOrgUnits, setOrgUnitItems])

    useEffect(() => {
        if (!rows && !hasOrgUnits && selectDefaultLevel && defaultLevel) {
            setOrgUnitItems({ items: [{ id: `LEVEL-${defaultLevel.id}` }] })
        }
    }, [rows, selectDefaultLevel, defaultLevel, hasOrgUnits, setOrgUnitItems])

    if (loading) {
        return (
            <div className={styles.loader}>
                <CenteredContent>
                    <CircularLoader />
                </CenteredContent>
            </div>
        )
    } else if (error?.message) {
        return <Help error>{error.message}</Help>
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
                data-test="orgunit-dimension-container"
            >
                <OrgUnitDimension
                    roots={roots?.map((r) => r.id)}
                    selected={orgUnits}
                    onSelect={setOrgUnitItems}
                    hideUserOrgUnits={hideUserOrgUnits}
                    hideLevelSelect={hideLevelSelect}
                    hideGroupSelect={hideGroupSelect}
                    warning={!hasOrgUnits ? warning : null}
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
    selectDefaultLevel: PropTypes.bool,
    selectRoots: PropTypes.bool,
    warning: PropTypes.string,
}

export default OrgUnitSelect
