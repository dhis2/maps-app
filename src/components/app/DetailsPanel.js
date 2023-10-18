import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector } from 'react-redux'
import FeatureProfile from '../feature/FeatureProfile.js'
import Interpretations from '../interpretations/Interpretations.js'
import OrgUnitProfile from '../orgunits/OrgUnitProfile.js'
import styles from './styles/DetailsPanel.module.css'

const DetailsPanel = ({ interpretationsRenderCount }) => {
    const detailsPanelOpen = useSelector((state) => state.ui.rightPanelOpen)
    const viewOrgUnitProfile = useSelector((state) => state.orgUnitProfile)
    const viewFeatureProfile = useSelector((state) => !!state.featureProfile)
    const interpretationId = useSelector((state) => state.interpretation?.id)

    const getContent = () => {
        if (
            interpretationId ||
            (detailsPanelOpen && !viewOrgUnitProfile && !viewFeatureProfile)
        ) {
            return <Interpretations renderCount={interpretationsRenderCount} />
        }

        if (detailsPanelOpen) {
            if (viewOrgUnitProfile) {
                return <OrgUnitProfile />
            }
            if (viewFeatureProfile) {
                return <FeatureProfile />
            }
        }

        return null
    }

    return (
        <div
            className={cx(styles.detailsPanel, {
                [styles.collapsed]: !detailsPanelOpen,
            })}
        >
            {getContent()}
        </div>
    )
}

DetailsPanel.propTypes = {
    interpretationsRenderCount: PropTypes.number.isRequired,
}

export default DetailsPanel
