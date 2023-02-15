import { OrgUnitDimension } from '@dhis2/analytics'
import { useDataQuery } from '@dhis2/app-runtime'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setOrgUnits } from '../../actions/layerEdit.js'
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
}

const OrgUnitSelect = ({
    hideAssociatedGeometry = false,
    hideSelectMode = true,
    hideLevelSelect = false,
    hideGroupSelect = false,
    warning,
    style,
}) => {
    const { loading, error, data } = useDataQuery(ORG_UNIT_TREE_QUERY)
    const rows = useSelector((state) => state.layerEdit.rows)
    const dispatch = useDispatch()

    const roots = data?.tree.organisationUnits.map(
        (rootOrgUnit) => rootOrgUnit.id
    )

    if (!roots) {
        return null // TODO: Loading indicator
    }

    const orgUnits = rows?.find((r) => r.dimension === 'ou')
    const hasOrgUnits = !!orgUnits?.items.length

    return (
        <div className={cx(styles.orgUnitSelect, [styles[style]])}>
            <OrgUnitDimension
                roots={roots}
                selected={orgUnits?.items || []}
                onSelect={(dimension) =>
                    dispatch(
                        setOrgUnits({
                            dimension: 'ou',
                            items: dimension.items,
                        })
                    )
                }
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
    style: PropTypes.string,
    warning: PropTypes.string,
}

export default OrgUnitSelect
