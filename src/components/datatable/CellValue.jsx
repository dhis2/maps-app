import PropTypes from 'prop-types'
import React from 'react'
import {
    RENDERER_COLOR,
    RENDERER_ICON,
    RENDERER_DATE,
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
    RENDERER_BOOLEAN,
    TYPE_DATE,
} from '../../constants/dataTable.js'
import { formatCellText } from '../../util/cellValue.js'
import styles from './styles/DataTable.module.css'

export const getCellRendererFlags = (renderer, type) => ({
    isColorCell: renderer === RENDERER_COLOR,
    isIconCell: renderer === RENDERER_ICON,
    isDateCell: renderer === RENDERER_DATE,
    isDateOnlyCell: type === TYPE_DATE,
    isOrgUnitHierarchyCell: renderer === RENDERER_ORG_UNIT,
    isOrgUnitNameCell: renderer === RENDERER_ORG_UNIT_NAME,
    isBooleanCell: renderer === RENDERER_BOOLEAN,
})

const NO_VALUE = '—'

const CellValue = ({
    value,
    renderer,
    type,
    orgUnitIdToName,
    keyAnalysisDigitGroupSeparator,
}) => {
    if (value == null) {
        return NO_VALUE
    }

    const { isIconCell } = getCellRendererFlags(renderer, type)

    if (isIconCell) {
        return (
            <img
                className={styles.iconCell}
                src={value}
                alt=""
                onError={(e) => {
                    e.target.style.visibility = 'hidden'
                }}
            />
        )
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
