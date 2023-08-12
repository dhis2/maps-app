import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setInterpretation } from '../../actions/interpretations.js'
import { openInterpretationsPanel } from '../../actions/ui.js'
import { getUrlParameter } from '../../util/requests.js'
import InterpretationsPanel from './InterpretationsPanel.js'

const Interpretations = ({ renderId }) => {
    const isMapLoaded = useSelector(
        (state) =>
            state.map.id && !state.map.mapViews.find((layer) => !layer.isLoaded)
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

    return isMapLoaded ? <InterpretationsPanel renderId={renderId} /> : null
}

Interpretations.propTypes = {
    renderId: PropTypes.number.isRequired,
}

export default Interpretations
