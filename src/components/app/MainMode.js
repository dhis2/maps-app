import React from 'react'
import LayersPanel from '../layers/LayersPanel.js'
import LayersToggle from '../layers/LayersToggle.js'
import LayersLoader from '../loaders/LayersLoader.js'
import AppMenu from './AppMenu.js'

const MainMode = () => (
    <>
        <AppMenu />
        <LayersToggle />
        <LayersPanel />
        <LayersLoader />
    </>
)

export default MainMode
