import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector } from 'react-redux'
import Interpretations from '../interpretations/Interpretations.js'
import OrgUnitProfile from '../orgunits/OrgUnitProfile.js'
import styles from './styles/DetailsPanel.module.css'

const DetailsPanel = ({ interpretationsRenderCount }) => {
    const detailsPanelOpen = useSelector((state) => state.ui.rightPanelOpen)
    const viewOrgUnitProfile = useSelector((state) => state.orgUnitProfile)
    const interpretationId = useSelector((state) => state.interpretation?.id)

    const getContent = () => {
        if (interpretationId || (detailsPanelOpen && !viewOrgUnitProfile)) {
            return <Interpretations renderCount={interpretationsRenderCount} />
        }

        return detailsPanelOpen ? <OrgUnitProfile /> : null
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
