import { Toolbar, HoverMenuBar } from '@dhis2/analytics'
import PropTypes from 'prop-types'
import React from 'react'
import DownloadButton from '../download/DownloadButton.js'
import InterpretationsToggle from '../interpretations/InterpretationsToggle.js'
import AddLayerButton from '../layers/overlays/AddLayerButton.js'
import FileMenu from './FileMenu.js'
import styles from './styles/AppMenu.module.css'

const AppMenu = ({ onFileMenuAction }) => (
    <div className={styles.toolbar}>
        <Toolbar>
            <AddLayerButton />
            <HoverMenuBar>
                <FileMenu onFileMenuAction={onFileMenuAction} />
                <DownloadButton />
            </HoverMenuBar>
            <InterpretationsToggle />
        </Toolbar>
    </div>
)

AppMenu.propTypes = {
    onFileMenuAction: PropTypes.func.isRequired,
}

export default AppMenu
