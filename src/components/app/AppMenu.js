import { Toolbar, HoverMenuBar } from '@dhis2/analytics'
import PropTypes from 'prop-types'
import React from 'react'
import DownloadButton from '../download/DownloadButton.js'
import InterpretationsToggle from '../interpretations/InterpretationsToggle.js'
import AddLayerButton from '../layers/overlays/AddLayerButton.js'
import ExperimentalModal from './ExperimentalModal.js'
// import FileMenu from './FileMenu.js'

// <FileMenu onFileMenuAction={onFileMenuAction} />
const AppMenu = (/* { onFileMenuAction } */) => (
    <>
        <Toolbar>
            <AddLayerButton />
            <HoverMenuBar>
                <DownloadButton />
            </HoverMenuBar>
            <InterpretationsToggle />
        </Toolbar>
        <ExperimentalModal />
    </>
)

AppMenu.propTypes = {
    onFileMenuAction: PropTypes.func.isRequired,
}

export default AppMenu
