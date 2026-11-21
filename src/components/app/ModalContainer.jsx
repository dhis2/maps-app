import React from 'react'
import { useSelector } from 'react-redux'
import LayerEdit from '../edit/LayerEdit.jsx'
import ContextMenu from '../map/ContextMenu.jsx'
import OpenAsMapDialog from '../openAs/OpenAsMapDialog.jsx'
import OsmFeatureModal from '../osmImport/OsmFeatureModal.jsx'

const ModalContainer = () => {
    const analyticalObject = useSelector((state) => state.analyticalObject)
    const osmFeatureForm = useSelector((state) => state.osmEdit.form)

    return (
        <>
            <ContextMenu />
            <LayerEdit />
            {analyticalObject && <OpenAsMapDialog />}
            {osmFeatureForm && <OsmFeatureModal />}
        </>
    )
}

export default ModalContainer
