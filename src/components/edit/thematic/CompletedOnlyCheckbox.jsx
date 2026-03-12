import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setEventStatus } from '../../../actions/layerEdit.js'
import {
    EVENT_STATUS_ALL,
    EVENT_STATUS_COMPLETED,
} from '../../../constants/eventStatuses.js'
import { Checkbox } from '../../core/index.js'

const CompletedOnlyCheckbox = ({ completedOnly, setEventStatus }) => {
    useEffect(() => {
        if (completedOnly) {
            setEventStatus(EVENT_STATUS_ALL)
        }
    }, [completedOnly, setEventStatus])

    return (
        <Checkbox
            style={{ margin: 'auto 0' }}
            label={i18n.t('Only show completed events')}
            checked={completedOnly}
            onChange={(isChecked) =>
                setEventStatus(
                    isChecked ? EVENT_STATUS_COMPLETED : EVENT_STATUS_ALL
                )
            }
        />
    )
}

CompletedOnlyCheckbox.propTypes = {
    setEventStatus: PropTypes.func.isRequired,
    completedOnly: PropTypes.bool,
}

export default connect(
    ({ layerEdit }) => ({
        completedOnly: layerEdit.eventStatus === EVENT_STATUS_COMPLETED,
    }),
    { setEventStatus }
)(CompletedOnlyCheckbox)
