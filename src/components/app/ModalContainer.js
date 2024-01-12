import React from 'react'
import { useSelector } from 'react-redux'
import AlertStack from '../alerts/AlertStack.js'
import LayerEdit from '../edit/LayerEdit.js'
import ContextMenu from '../map/ContextMenu.js'
import OpenAsMapDialog from '../openAs/OpenAsMapDialog.js'

const ModalContainer = () => {
    const analyticalObject = useSelector((state) => state.analyticalObject)

    return (
        <>
            <ContextMenu />
            <LayerEdit />
            <AlertStack />
            {analyticalObject && <OpenAsMapDialog />}
        </>
    )
}

export default ModalContainer
