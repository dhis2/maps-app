import { Toolbar, HoverMenuBar } from '@dhis2/analytics'
import PropTypes from 'prop-types'
import React from 'react'
import DownloadButton from '../download/DownloadButton.js'
import InterpretationsToggle from '../interpretations/InterpretationsToggle.js'
import AddLayerButton from '../layers/overlays/AddLayerButton.js'
import FileMenu from './FileMenu.js'
import SettingsMenu from '../settings/SettingsMenu.js'

const AppMenu = ({ onFileMenuAction }) => (
    <Toolbar>
        <AddLayerButton />
        <HoverMenuBar>
            <FileMenu onFileMenuAction={onFileMenuAction} />
            <DownloadButton />
            <SettingsMenu />
        </HoverMenuBar>
        <InterpretationsToggle />
    </Toolbar>
)

AppMenu.propTypes = {
    onFileMenuAction: PropTypes.func.isRequired,
}

export default AppMenu
