import { OrgUnitDimension } from '@dhis2/analytics'
import { useDataQuery } from '@dhis2/app-runtime'
import { CenteredContent, CircularLoader, Help } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setOrgUnits } from '../../actions/layerEdit.js'
import { translateOrgUnitLevels } from '../../util/orgUnits.js'
import OrgUnitFieldSelect from './OrgUnitFieldSelect.js'
import OrgUnitSelectMode from './OrgUnitSelectMode.js'
import styles from './styles/OrgUnitSelect.module.css'

// Fetches the root org units associated with the current user with fallback to data capture org units
const ORG_UNIT_TREE_QUERY = {
    tree: {
        resource: 'organisationUnits',
        params: () => ({
            fields: ['id'],
            userDataViewFallback: true,
        }),
    },
    levels: {
        resource: 'organisationUnitLevels',
        params: {
            fields: ['id', 'level'],
            order: 'level:asc',
            paging: false,
        },
    },
}

const OrgUnitSelect = ({
    hideUserOrgUnits = false,
    hideAssociatedGeometry = false,
    hideSelectMode = true,
    hideLevelSelect = false,
    hideGroupSelect = false,
    setDefaultLevel = false,
    warning,
    style,
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

    const roots = data?.tree.organisationUnits.map(
        (rootOrgUnit) => rootOrgUnit.id
    )

    const orgUnitLevels = data?.levels.organisationUnitLevels
    const defaultLevel = orgUnitLevels?.[1]

    const orgUnits = translateOrgUnitLevels(
        rows?.find((r) => r.dimension === 'ou'),
        orgUnitLevels
    )
    const hasOrgUnits = !!orgUnits.length

    useEffect(() => {
        if (!hasOrgUnits && setDefaultLevel && defaultLevel) {
            setOrgUnitItems({ items: [{ id: `LEVEL-${defaultLevel.id}` }] })
        }
    }, [setDefaultLevel, defaultLevel, hasOrgUnits, setOrgUnitItems])

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

    console.log('orgUnits', orgUnits)

    return (
        <div className={cx(styles.orgUnitSelect, [styles[style]])}>
            <OrgUnitDimension
                roots={roots}
                selected={orgUnits}
                onSelect={setOrgUnitItems}
                hideUserOrgUnits={hideUserOrgUnits}
                hideLevelSelect={hideLevelSelect}
                hideGroupSelect={hideGroupSelect}
                warning={!hasOrgUnits ? warning : null}
            />
            {!hideAssociatedGeometry && <OrgUnitFieldSelect />}
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
    setDefaultLevel: PropTypes.bool,
    style: PropTypes.string,
    warning: PropTypes.string,
}

export default OrgUnitSelect
