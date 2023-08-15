import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector } from 'react-redux'
import Drawer from '../core/Drawer.js'
import Interpretations from '../interpretations/Interpretations.js'
import OrgUnitProfile from '../orgunits/OrgUnitProfile.js'
import styles from './styles/DetailsPanel.module.css'

const DetailsPanel = ({ interpretationsRenderId }) => {
    const detailsPanelOpen = useSelector((state) => state.ui.rightPanelOpen)
    const viewOrgUnitProfile = useSelector((state) => state.orgUnitProfile)

    const getContent = () => {
        if (!detailsPanelOpen) {
            return null
        }

        return (
            <Drawer position="right">
                {viewOrgUnitProfile ? (
                    <OrgUnitProfile />
                ) : (
                    <Interpretations renderId={interpretationsRenderId} />
                )}
            </Drawer>
        )
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
    interpretationsRenderId: PropTypes.number.isRequired,
}

export default DetailsPanel
