import { Toolbar } from '@dhis2/analytics'
import PropTypes from 'prop-types'
import React from 'react'
import DownloadButton from '../download/DownloadButton.js'
import InterpretationsToggle from '../interpretations/InterpretationsToggle.js'
import AddLayerButton from '../layers/overlays/AddLayerButton.js'
import FileMenu from './FileMenu.js'

const AppMenu = ({ onFileMenuAction }) => (
    <Toolbar>
        <AddLayerButton />
        <FileMenu onFileMenuAction={onFileMenuAction} />
        <DownloadButton />
        <InterpretationsToggle />
    </Toolbar>
)

AppMenu.propTypes = {
    onFileMenuAction: PropTypes.func.isRequired,
}

export default AppMenu
