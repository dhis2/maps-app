import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { openInterpretationsPanel } from '../../actions/ui.js'
import InterpretationsPanel from './InterpretationsPanel.jsx'

const Interpretations = ({ renderCount }) => {
    const isMapLoaded = useSelector(
        (state) =>
            state.map.id && !state.map.mapViews.find((layer) => !layer.isLoaded)
    )
    const dispatch = useDispatch()

    useEffect(() => {
        if (isMapLoaded) {
            dispatch(openInterpretationsPanel())
        }
    }, [isMapLoaded, dispatch])

    return isMapLoaded ? (
        <InterpretationsPanel renderCount={renderCount} />
    ) : null
}

Interpretations.propTypes = {
    renderCount: PropTypes.number.isRequired,
}

export default Interpretations
