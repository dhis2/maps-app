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
import history from '../../util/history.js'
import {
    useInterpretationQueryParams,
    removeInterpretationQueryParams,
} from '../../util/interpretationIdQueryParams.js'
import Drawer from '../core/Drawer.js'
import InterpretationMap from './InterpretationMap.js'
// import InterpretationModal from './InterpretationModal.js'

const navigateToOpenModal = (interpretationId, initialFocus) => {
    history.push(
        {
            pathName: history.location.pathname,
            search: `?${queryString.stringify({
                interpretationId,
                initialFocus,
            })}`,
        },
        { isModalOpening: true }
    )
}

const InterpretationsPanel = ({ renderCount }) => {
    const { currentUser } = useCachedDataQuery()
    const { interpretationId, initialFocus } = useInterpretationQueryParams()
    // const [initialFocus, setInitialFocus] = useState(false) // TODO figure out initialFocus
    const interpretationsUnitRef = useRef()
    const map = useSelector((state) => state.map)
    // const interpretationId = useSelector((state) => state.interpretation.id)

    const onInterpretationClick = useCallback((interpretationId) => {
        navigateToOpenModal(interpretationId)
    }, [])

    const onReplyIconClick = useCallback((interpretationId) => {
        navigateToOpenModal(interpretationId, true)
    }, [])

    return (
        <>
            <Drawer>
                <AboutAOUnit type="map" id={map.id} renderId={renderCount} />
                <InterpretationsUnit
                    ref={interpretationsUnitRef}
                    type="map"
                    id={map.id}
                    currentUser={currentUser}
                    onInterpretationClick={onInterpretationClick}
                    onReplyIconClick={onReplyIconClick}
                    // disabled={disabled}
                    // renderId={interpretationsUnitRenderId}
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
                    onClose={removeInterpretationQueryParams}
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
