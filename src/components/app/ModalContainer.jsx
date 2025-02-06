import React from 'react'
import { useSelector } from 'react-redux'
import LayerEdit from '../edit/LayerEdit.jsx'
import ContextMenu from '../map/ContextMenu.jsx'
import OpenAsMapDialog from '../openAs/OpenAsMapDialog.jsx'

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
