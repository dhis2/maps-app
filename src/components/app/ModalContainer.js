import React from 'react'
import { useSelector } from 'react-redux'
import LayerEdit from '../edit/LayerEdit.js'
import ContextMenu from '../map/ContextMenu.js'
import OpenAsMapDialog from '../openAs/OpenAsMapDialog.js'

const ModalContainer = () => {
    const analyticalObject = useSelector((state) => state.analyticalObject)

    return (
        <>
            <ContextMenu />
            <LayerEdit />
            {analyticalObject && <OpenAsMapDialog />}
        </>
    )
}

export default ModalContainer
