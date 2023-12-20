import { InterpretationsAndDetailsToggler as AnalyticsInterpretationsAndDetailsToggler } from '@dhis2/analytics'
import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    openInterpretationsPanel,
    closeInterpretationsPanel,
} from '../../actions/ui.js'

const InterpretationsToggle = () => {
    const interpretationsEnabled = useSelector((state) => Boolean(state.map.id))
    const interpretationsOpen = useSelector(
        (state) => state.ui.rightPanelOpen && !state.orgUnitProfile
    )
    const dispatch = useDispatch()

    const onClick = useCallback(() => {
        if (interpretationsOpen) {
            dispatch(closeInterpretationsPanel())
        } else {
            dispatch(openInterpretationsPanel())
        }
    }, [dispatch, interpretationsOpen])

    return (
        <AnalyticsInterpretationsAndDetailsToggler
            disabled={!interpretationsEnabled}
            onClick={onClick}
            isShowing={interpretationsOpen}
        />
    )
}

export default InterpretationsToggle
