import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { OrganisationUnitTree } from '@dhis2/ui'
// import orgUnitStyles from '@dhis2/d2-ui-org-unit-dialog/styles/OrgUnitSelector.style'
// import { OrgUnitTreeMultipleRoots } from '@dhis2/d2-ui-org-unit-tree'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import styles from './styles/OrgUnitTree.module.css'

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

const OrgUnitTree = ({ selected, disabled, onClick }) => {
    const { loading, error, data } = useDataQuery(ORG_UNIT_TREE_QUERY)

    const onSelectClick = useCallback(
        (evt, orgUnit) => {
            if (!disabled) {
                onClick(orgUnit)
            }
        },
        [disabled, onClick]
    )

    console.log('#', loading, error, data)

    // TODO: Add loading indicator
    if (loading) {
        return null
    }

    const roots = data?.tree.organisationUnits.map(
        (rootOrgUnit) => rootOrgUnit.id
    )

    console.log('roots', roots, selected)

    return (
        <div className={styles.orgUnitTree}>
            <OrganisationUnitTree
                roots={roots}
                initiallyExpanded={[
                    ...(roots.length === 1 ? [`/${roots[0]}`] : []),
                ]}
                selected={[]}
                onChange={console.log}
                dataTest={'org-unit-tree'}
            />
            {disabled ? (
                <div className={styles.disabled}>
                    {i18n.t(
                        'It’s not possible to combine user organisation units and select individual units.'
                    )}
                </div>
            ) : null}
        </div>
    )
}

OrgUnitTree.propTypes = {
    disabled: PropTypes.bool,
    selected: PropTypes.array,
    onClick: PropTypes.func,
}

export default OrgUnitTree

/*
class OrgUnitTreeMaps extends Component {
    static propTypes = {
        loadOrgUnitTree: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        roots: PropTypes.array,
        selected: PropTypes.array,
        onClick: PropTypes.func,
    }

    componentDidMount() {
        const { roots, loadOrgUnitTree } = this.props

        if (!roots) {
            loadOrgUnitTree()
        }
    }

    render() {
        const { roots, selected, disabled } = this.props

        // TODO: Add loading indicator
        if (!roots) {
            return null
        }

        return (
            <div className={styles.orgUnitTree}>
                <OrgUnitTreeMultipleRoots
                    roots={roots}
                    selected={selected
                        .filter((item) => item.path)
                        .map((item) => item.path)}
                    initiallyExpanded={roots.map((root) => root.path)}
                    onSelectClick={this.onSelectClick}
                    showFolderIcon
                    disableSpacer
                    {...orgUnitStyles.orgUnitTree}
                />
                {disabled ? (
                    <div className={styles.disabled}>
                        {i18n.t(
                            'It’s not possible to combine user organisation units and select individual units.'
                        )}
                    </div>
                ) : null}
            </div>
        )
    }

    onSelectClick = (evt, orgUnit) => {
        if (!this.props.disabled) {
            this._isClicked = true
            this.props.onClick(orgUnit)
        }
    }
}

export default connect(
    (state) => ({
        roots: state.orgUnitTree,
    }),
    { loadOrgUnitTree }
)(OrgUnitTreeMaps)
*/
