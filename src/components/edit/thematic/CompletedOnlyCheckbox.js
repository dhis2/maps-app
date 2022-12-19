import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setEventStatus } from '../../../actions/layerEdit.js'
import { dimConf } from '../../../constants/dimension.js'
import {
    EVENT_STATUS_ALL,
    EVENT_STATUS_COMPLETED,
} from '../../../constants/eventStatuses.js'
import { Checkbox } from '../../core/index.js'

const eventDataTypes = [
    dimConf.indicator.objectName,
    dimConf.programIndicator.objectName,
    dimConf.eventDataItem.objectName,
]

const CompletedOnlyCheckbox = ({
    valueType,
    completedOnly,
    setEventStatus,
}) => {
    const hasEventData = eventDataTypes.includes(valueType)

    useEffect(() => {
        if (completedOnly && !hasEventData) {
            setEventStatus(EVENT_STATUS_ALL)
        }
    }, [completedOnly, hasEventData, setEventStatus])

    return hasEventData ? (
        <Checkbox
            label={i18n.t('Only show completed events')}
            checked={completedOnly}
            onChange={(isChecked) =>
                setEventStatus(
                    isChecked ? EVENT_STATUS_COMPLETED : EVENT_STATUS_ALL
                )
            }
        />
    ) : null
}

CompletedOnlyCheckbox.propTypes = {
    setEventStatus: PropTypes.func.isRequired,
    completedOnly: PropTypes.bool,
    valueType: PropTypes.string,
}

export default connect(
    ({ layerEdit }) => ({
        completedOnly: layerEdit.eventStatus === EVENT_STATUS_COMPLETED,
    }),
    { setEventStatus }
)(CompletedOnlyCheckbox)
