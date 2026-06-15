import { Toolbar, HoverMenuBar } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { IconChevronLeft24, IconChevronRight24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import DownloadButton from '../download/DownloadButton.jsx'
import InterpretationsToggle from '../interpretations/InterpretationsToggle.jsx'
import AddLayerButton from '../layers/overlays/AddLayerButton.jsx'
import FileMenu from './FileMenu.jsx'
import styles from './styles/MenuButton.module.css'

const AppMenu = ({
    onFileMenuAction,
    aiEnabled,
    assistantOpen,
    onAssistantToggle,
}) => (
    <Toolbar>
        <AddLayerButton />
        <HoverMenuBar>
            <FileMenu onFileMenuAction={onFileMenuAction} />
            <DownloadButton />
        </HoverMenuBar>
        <InterpretationsToggle />
        {aiEnabled && (
            <button className={styles.menuButton} onClick={onAssistantToggle}>
                {assistantOpen ? <IconChevronRight24 /> : <IconChevronLeft24 />}
                {i18n.t('AI assistant')}
            </button>
        )}
    </Toolbar>
)

AppMenu.propTypes = {
    onFileMenuAction: PropTypes.func.isRequired,
    aiEnabled: PropTypes.bool,
    assistantOpen: PropTypes.bool,
    onAssistantToggle: PropTypes.func,
}

export default AppMenu
