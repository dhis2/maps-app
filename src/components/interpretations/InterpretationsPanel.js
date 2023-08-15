import {
    AboutAOUnit,
    InterpretationsUnit,
    InterpretationModal,
} from '@dhis2/analytics'
import { useD2 } from '@dhis2/app-runtime-adapter-d2'
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
    renderId,
}) => {
    const [initialFocus, setInitialFocus] = useState(false)
    const interpretationsUnitRef = useRef()
    const { d2 } = useD2()

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
                <AboutAOUnit type="map" id={map.id} renderId={renderId} />
                <InterpretationsUnit
                    ref={interpretationsUnitRef}
                    type="map"
                    id={map.id}
                    currentUser={d2.currentUser}
                    onInterpretationClick={onInterpretationClick}
                    onReplyIconClick={onReplyIconClick}
                />
            </Drawer>
            {interpretationId && (
                <InterpretationModal
                    currentUser={d2.currentUser}
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
    renderId: PropTypes.number.isRequired,
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
