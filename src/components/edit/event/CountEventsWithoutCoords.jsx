import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setCountEventsWithoutCoordinates } from '../../../actions/layerEdit.js'
import Checkbox from '../../core/Checkbox.jsx'

const CountEventsWithoutCoords = ({
    countEventsWithoutCoordinates,
    setCountEventsWithoutCoordinates,
}) => (
    <Checkbox
        label={i18n.t('Count events without coordinates')}
        checked={!!countEventsWithoutCoordinates}
        onChange={setCountEventsWithoutCoordinates}
    />
)

CountEventsWithoutCoords.propTypes = {
    setCountEventsWithoutCoordinates: PropTypes.func.isRequired,
    countEventsWithoutCoordinates: PropTypes.bool,
}

export default connect(
    ({ layerEdit }) => ({
        countEventsWithoutCoordinates: layerEdit.countEventsWithoutCoordinates,
    }),
    { setCountEventsWithoutCoordinates }
)(CountEventsWithoutCoords)
