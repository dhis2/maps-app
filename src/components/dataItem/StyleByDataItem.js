import i18n from '@dhis2/d2-i18n'
import { Help } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setStyleDataItem } from '../../actions/layerEdit.js'
import DataItemSelect from './DataItemSelect.js'
import DataItemStyle from './DataItemStyle.js'

// Style by data item is used by event layer, and can be reused for TEI layer in the future.
// Displays a select field with data items that support styling.
// Styling options are shown when a data item is selected.
export const StyleByDataItem = ({
    program,
    programStage,
    styleDataItem,
    setStyleDataItem,
    error,
}) => (
    <div>
        <DataItemSelect
            key="select"
            label={i18n.t('Style by data element')}
            program={program}
            programStage={programStage}
            allowNone={true}
            value={styleDataItem ? styleDataItem.id : null}
            excludeTypes={[
                'DATE',
                'FILE_RESOURCE',
                'ORGANISATION_UNIT',
                'COORDINATE',
            ]}
            onChange={setStyleDataItem}
        />
        {styleDataItem && (
            <DataItemStyle key="style" dataItem={styleDataItem} />
        )}
        {error && <Help error>{error}</Help>}
    </div>
)

StyleByDataItem.propTypes = {
    setStyleDataItem: PropTypes.func.isRequired,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    program: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    programStage: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    styleDataItem: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default connect(
    ({ layerEdit }) => ({
        program: layerEdit.program,
        programStage: layerEdit.programStage,
        styleDataItem: layerEdit.styleDataItem,
    }),
    { setStyleDataItem }
)(StyleByDataItem)
