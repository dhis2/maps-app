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
import {
    formatBoolean,
    formatDate,
    formatDatetime,
} from '../../util/helpers.js'
import { formatWithSeparator } from '../../util/numbers.js'
import {
    formatOrgUnitOwnName,
    formatOrgUnitPathBreadcrumb,
} from '../../util/orgUnitGroups.js'
import styles from './styles/DataTable.module.css'

// Shared between DataTable.jsx and CombinedDataTable.jsx - which renderer a
// column uses determines both its cell content (CellValue, below) and its
// DataTableCell className (isDarkColor/monoCell/backgroundColor - computed
// by each caller since those touch component-specific selected/hovered/
// pinned state too), so both need these same flags.
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

    const {
        isColorCell,
        isIconCell,
        isDateCell,
        isDateOnlyCell,
        isOrgUnitHierarchyCell,
        isOrgUnitNameCell,
        isBooleanCell,
    } = getCellRendererFlags(renderer, type)

    if (isColorCell) {
        return value.toLowerCase()
    }

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

    if (isDateCell) {
        return isDateOnlyCell ? formatDate(value) : formatDatetime(value)
    }

    if (isOrgUnitHierarchyCell) {
        return formatOrgUnitPathBreadcrumb(value, orgUnitIdToName)
    }

    if (isOrgUnitNameCell) {
        return formatOrgUnitOwnName(value, orgUnitIdToName)
    }

    if (isBooleanCell) {
        return formatBoolean(value)
    }

    return formatWithSeparator(value, keyAnalysisDigitGroupSeparator)
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
