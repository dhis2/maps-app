import PropTypes from 'prop-types'
import React from 'react'
import { RENDERER_ICON } from '../../constants/dataTable.js'
import { formatCellText } from '../../util/tableCells.js'
import styles from './styles/DataTable.module.css'

const CellValue = ({
    value,
    renderer,
    type,
    orgUnitIdToName,
    keyAnalysisDigitGroupSeparator,
}) => {
    if (renderer === RENDERER_ICON) {
        return value ? (
            <img
                className={styles.iconCell}
                src={value}
                alt=""
                onError={(e) => {
                    e.target.style.visibility = 'hidden'
                }}
            />
        ) : null
    }

    return formatCellText(value, {
        renderer,
        type,
        orgUnitIdToName,
        keyAnalysisDigitGroupSeparator,
    })
}

CellValue.propTypes = {
    keyAnalysisDigitGroupSeparator: PropTypes.string,
    orgUnitIdToName: PropTypes.instanceOf(Map),
    renderer: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
    ]),
}

export default CellValue
