import {
    AboutAOUnit,
    InterpretationsUnit,
    InterpretationModal,
} from '@dhis2/analytics'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import history, { getHashUrlParams } from '../../util/history.js'
import Drawer from '../core/Drawer.jsx'
import InterpretationMap from './InterpretationMap.jsx'

const openInterpretationModal = (interpretationId, initialFocus) => {
    history.push(
        `${history.location.pathname}?${queryString.stringify({
            interpretationId,
            initialFocus,
        })}`
    )
}

const closeInterpretationModal = () => {
    history.push(history.location.pathname)
}

const InterpretationsPanel = ({ renderCount }) => {
    const map = useSelector((state) => state.map)
    const interpretationId = useSelector((state) => state.interpretation?.id)

    const onReplyIconClick = useCallback((interpretationId) => {
        openInterpretationModal(interpretationId, true)
    }, [])

    const { initialFocus } = getHashUrlParams(history.location)

    return (
        <>
            <Drawer>
                <AboutAOUnit type="map" id={map.id} renderId={renderCount} />
                <InterpretationsUnit
                    type="map"
                    id={map.id}
                    onInterpretationClick={openInterpretationModal}
                    onReplyIconClick={onReplyIconClick}
                />
            </Drawer>
            {interpretationId && (
                <InterpretationModal
                    initialFocus={initialFocus}
                    interpretationId={interpretationId}
                    isVisualizationLoading={false}
                    onClose={closeInterpretationModal}
                    onResponsesReceived={Function.prototype} // Required prop
                    visualization={map}
                    pluginComponent={InterpretationMap}
                />
            )}
        </>
    )
}

InterpretationsPanel.propTypes = {
    renderCount: PropTypes.number.isRequired,
}

export default InterpretationsPanel
