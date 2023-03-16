import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setInterpretation } from '../../actions/interpretations.js'
import { openInterpretationsPanel } from '../../actions/ui.js'
import { getUrlParameter } from '../../util/requests.js'
import InterpretationsPanel from './InterpretationsPanel.js'

const Interpretations = () => {
    const isMapLoaded = useSelector(
        (state) =>
            state.map.id && !state.map.mapViews.find((layer) => !layer.isLoaded)
    )
    const isPanelOpen = useSelector(
        (state) => state.ui.rightPanelOpen && !state.orgUnitProfile
    )
    const dispatch = useDispatch()

    useEffect(() => {
        if (isMapLoaded) {
            const urlInterpretationId = getUrlParameter('interpretationid')

            if (urlInterpretationId) {
                dispatch(setInterpretation(urlInterpretationId))
                dispatch(openInterpretationsPanel())
            }
        }
    }, [isMapLoaded, dispatch])

    return isPanelOpen && isMapLoaded ? <InterpretationsPanel /> : null
}

export default Interpretations
