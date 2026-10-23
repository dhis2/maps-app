import { Toolbar, HoverMenuBar } from '@dhis2/analytics'
import PropTypes from 'prop-types'
import React from 'react'
import DownloadButton from '../download/DownloadButton.jsx'
import InterpretationsToggle from '../interpretations/InterpretationsToggle.jsx'
import AddLayerButton from '../layers/overlays/AddLayerButton.jsx'
import OsmImportButton from '../osmImport/OsmImportButton.jsx'
import FileMenu from './FileMenu.jsx'

const AppMenu = ({ onFileMenuAction }) => (
    <Toolbar>
        <AddLayerButton />
        <HoverMenuBar>
            <FileMenu onFileMenuAction={onFileMenuAction} />
            <DownloadButton />
            <OsmImportButton />
        </HoverMenuBar>
        <InterpretationsToggle />
    </Toolbar>
)

AppMenu.propTypes = {
    onFileMenuAction: PropTypes.func.isRequired,
}

export default AppMenu
