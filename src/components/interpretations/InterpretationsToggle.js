import i18n from '@dhis2/d2-i18n'
import { IconChevronLeft24, IconChevronRight24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import {
    openInterpretationsPanel,
    closeInterpretationsPanel,
} from '../../actions/ui.js'
import { MenuButton } from '../core/index.js'
import styles from './styles/InterpretationsToggle.module.css'

export const InterpretationsToggle = ({
    interpretationsOpen,
    interpretationsEnabled,
    openInterpretationsPanel,
    closeInterpretationsPanel,
}) => (
    <div className={styles.button}>
        <MenuButton
            onClick={
                interpretationsOpen
                    ? closeInterpretationsPanel
                    : openInterpretationsPanel
            }
            disabled={!interpretationsEnabled}
        >
            {interpretationsOpen ? (
                <IconChevronRight24 />
            ) : (
                <IconChevronLeft24 />
            )}
            {i18n.t('Interpretations')}
        </MenuButton>
    </div>
)

InterpretationsToggle.propTypes = {
    closeInterpretationsPanel: PropTypes.func.isRequired,
    interpretationsEnabled: PropTypes.bool.isRequired,
    interpretationsOpen: PropTypes.bool.isRequired,
    openInterpretationsPanel: PropTypes.func.isRequired,
}

export default connect(
    (state) => ({
        interpretationsOpen: state.ui.rightPanelOpen && !state.orgUnitProfile,
        interpretationsEnabled: Boolean(state.map.id),
    }),
    {
        openInterpretationsPanel,
        closeInterpretationsPanel,
    }
)(InterpretationsToggle)
