import i18n from '@dhis2/d2-i18n'
import { Button, IconTable16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch } from 'react-redux'
import { openDataTable } from '../../actions/dataTable.js'
import { highlightFeature } from '../../actions/feature.js'

// Opens the data table for the layer (if closed) and reveals the feature's row
const ShowInDataTableButton = ({ layerId, featureId }) => {
    const dispatch = useDispatch()

    return (
        <Button
            small
            icon={<IconTable16 />}
            onClick={() => {
                dispatch(openDataTable(layerId))
                dispatch(
                    highlightFeature({
                        id: featureId,
                        layerId,
                        origin: 'popup',
                    })
                )
            }}
            dataTest="popup-show-in-data-table"
        >
            {i18n.t('Show in data table')}
        </Button>
    )
}

ShowInDataTableButton.propTypes = {
    featureId: PropTypes.string.isRequired,
    layerId: PropTypes.string.isRequired,
}

export default ShowInDataTableButton
