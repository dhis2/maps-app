import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setInterpretation } from '../../actions/interpretations.js'
import { openInterpretationsPanel } from '../../actions/ui.js'
import { getUrlParameter } from '../../util/requests.js'
import InterpretationsPanel from './InterpretationsPanel.js'

const Interpretations = () => {
    const mapId = useSelector((state) => state.map.id)
    const layersAreLoaded = useSelector(
        (state) => !state.map.mapViews.find((layer) => !layer.isLoaded)
    )
    const isPanelOpen = useSelector(
        (state) => state.ui.rightPanelOpen && !state.orgUnitProfile
    )
    const dispatch = useDispatch()

    useEffect(() => {
        if (mapId) {
            const urlInterpretationId = getUrlParameter('interpretationid')

            if (urlInterpretationId) {
                dispatch(setInterpretation(urlInterpretationId))
                dispatch(openInterpretationsPanel())
            }
        }
    }, [mapId, dispatch])

    return isPanelOpen && mapId && layersAreLoaded ? (
        <InterpretationsPanel />
    ) : null
}

export default Interpretations
