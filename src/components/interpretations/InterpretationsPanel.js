import {
    AboutAOUnit,
    InterpretationsUnit,
    InterpretationModal,
    useCachedDataQuery,
} from '@dhis2/analytics'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import React, { useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import history, { getHashUrlParams } from '../../util/history.js'
import Drawer from '../core/Drawer.js'
import InterpretationMap from './InterpretationMap.js'

const openInterpretationModal = (interpretationId, initialFocus) => {
    history.push(
        `${history.location.pathname}?${queryString.stringify({
            interpretationId,
            initialFocus,
        })}`,

        { isModalOpening: true }
    )
}

const closeInterpretationModal = () => {
    history.push(history.location.pathname, {
        isModalClosing: true,
    })
}

const InterpretationsPanel = ({ renderCount }) => {
    const { currentUser } = useCachedDataQuery()
    const interpretationsUnitRef = useRef()
    const map = useSelector((state) => state.map)
    const interpretationId = useSelector((state) => state.interpretation?.id)

    const onReplyIconClick = useCallback((interpretationId) => {
        openInterpretationModal(interpretationId, true)
    }, [])

    const { initialFocus } = getHashUrlParams()

    return (
        <>
            <Drawer>
                <AboutAOUnit type="map" id={map.id} renderId={renderCount} />
                <InterpretationsUnit
                    ref={interpretationsUnitRef}
                    type="map"
                    id={map.id}
                    currentUser={currentUser}
                    onInterpretationClick={openInterpretationModal}
                    onReplyIconClick={onReplyIconClick}
                />
            </Drawer>
            {interpretationId && (
                <InterpretationModal
                    currentUser={currentUser}
                    onInterpretationUpdate={() =>
                        interpretationsUnitRef.current.refresh()
                    }
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
