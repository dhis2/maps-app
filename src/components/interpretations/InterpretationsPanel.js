import {
    AboutAOUnit,
    InterpretationsUnit,
    InterpretationModal,
    useCachedDataQuery,
} from '@dhis2/analytics'
import PropTypes from 'prop-types'
import React, { useState, useRef, useCallback } from 'react'
import { connect } from 'react-redux'
import { setInterpretation } from '../../actions/interpretations.js'
import Drawer from '../core/Drawer.js'
import InterpretationMap from './InterpretationMap.js'

const InterpretationsPanel = ({
    interpretationId,
    map,
    setInterpretation,
    renderCount,
}) => {
    const { currentUser } = useCachedDataQuery()
    const [initialFocus, setInitialFocus] = useState(false)
    const interpretationsUnitRef = useRef()

    const onInterpretationClick = useCallback(
        (interpretationId) => {
            setInterpretation(interpretationId)
        },
        [setInterpretation]
    )

    const onReplyIconClick = useCallback(
        (interpretationId) => {
            setInitialFocus(true)
            setInterpretation(interpretationId)
        },
        [setInterpretation]
    )

    const onModalClose = useCallback(() => {
        setInitialFocus(false)
        setInterpretation()
    }, [setInterpretation])

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
                    onClose={onModalClose}
                    onResponsesReceived={Function.prototype} // Required prop
                    visualization={map}
                    pluginComponent={InterpretationMap}
                />
            )}
        </>
    )
}

InterpretationsPanel.propTypes = {
    map: PropTypes.object.isRequired,
    renderCount: PropTypes.number.isRequired,
    setInterpretation: PropTypes.func.isRequired,
    interpretationId: PropTypes.string,
}

export default connect(
    (state) => ({
        map: state.map,
        interpretationId: state.interpretation.id,
    }),
    {
        setInterpretation,
    }
)(InterpretationsPanel)
