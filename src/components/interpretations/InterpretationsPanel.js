import {
    AboutAOUnit,
    InterpretationsUnit,
    InterpretationModal,
} from '@dhis2/analytics'
import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import PropTypes from 'prop-types'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { setInterpretation } from '../../actions/interpretations.js'
import { getUrlParameter } from '../../util/requests.js'
import Drawer from '../core/Drawer.js'
import InterpretationMap from './InterpretationMap.js'

const InterpretationsPanel = ({
    interpretationId,
    map,
    isPanelOpen,
    setInterpretation,
}) => {
    const [isMapLoading, setIsMapLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState()
    const [initialFocus, setInitialFocus] = useState(false)
    const interpretationsUnitRef = useRef()
    const { d2 } = useD2()

    const onInterpretationClick = useCallback(
        (interpretationId) => {
            setInterpretation(interpretationId)
            setIsModalOpen(true)
        },
        [setInterpretation]
    )

    const onReplyIconClick = useCallback(
        (interpretationId) => {
            setInitialFocus(true)
            setInterpretation(interpretationId)
            setIsModalOpen(true)
        },
        [setInterpretation]
    )

    const onModalClose = useCallback(() => {
        setIsModalOpen(false)
        setInitialFocus(false)

        // Small timeout added as the interpretation modal onClose is called before the
        // modal is actaully closed. It needs to be closed to free the webgl context used.
        setTimeout(setInterpretation, 100)
    }, [setInterpretation])

    useEffect(() => {
        const urlInterpretationId = getUrlParameter('interpretationid')

        if (urlInterpretationId) {
            setInterpretation(urlInterpretationId)
            setIsModalOpen(true)
        }
    }, [setInterpretation])

    if (!map?.id) {
        return null
    }

    return (
        <>
            {isPanelOpen && (
                <Drawer>
                    <AboutAOUnit type="map" id={map.id} />
                    <InterpretationsUnit
                        ref={interpretationsUnitRef}
                        type="map"
                        id={map.id}
                        currentUser={d2.currentUser}
                        onInterpretationClick={onInterpretationClick}
                        onReplyIconClick={onReplyIconClick}
                    />
                </Drawer>
            )}
            {isModalOpen && interpretationId && (
                <InterpretationModal
                    currentUser={d2.currentUser}
                    onInterpretationUpdate={() =>
                        interpretationsUnitRef.current.refresh()
                    }
                    initialFocus={initialFocus}
                    interpretationId={interpretationId}
                    isVisualizationLoading={isMapLoading}
                    onClose={onModalClose}
                    onResponsesReceived={() => setIsMapLoading(false)}
                    visualization={map}
                    pluginComponent={InterpretationMap}
                />
            )}
        </>
    )
}

InterpretationsPanel.propTypes = {
    map: PropTypes.object.isRequired,
    setInterpretation: PropTypes.func.isRequired,
    interpretationId: PropTypes.string,
    isPanelOpen: PropTypes.bool,
}

export default connect(
    (state) => ({
        map: state.map,
        isPanelOpen: state.ui.rightPanelOpen && !state.orgUnitProfile,
        interpretationId: state.interpretation.id,
    }),
    {
        setInterpretation,
    }
)(InterpretationsPanel)
