import {
    RENDERER_COLOR,
    RENDERER_DATE,
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
    RENDERER_BOOLEAN,
    TYPE_DATE,
} from '../constants/dataTable.js'
import { formatBoolean, formatDate, formatDatetime } from './helpers.js'
import { formatWithSeparator } from './numbers.js'
import {
    formatOrgUnitOwnName,
    formatOrgUnitPathBreadcrumb,
} from './orgUnitGroups.js'

export const formatCellText = (
    value,
    { renderer, type, orgUnitIdToName, keyAnalysisDigitGroupSeparator } = {}
) => {
    if (value == null || value === '') {
        return ''
    }
    switch (renderer) {
        case RENDERER_COLOR:
            return value.toLowerCase()
        case RENDERER_DATE:
            return type === TYPE_DATE
                ? formatDate(value)
                : formatDatetime(value)
        case RENDERER_ORG_UNIT:
            return formatOrgUnitPathBreadcrumb(value, orgUnitIdToName)
        case RENDERER_ORG_UNIT_NAME:
            return formatOrgUnitOwnName(value, orgUnitIdToName)
        case RENDERER_BOOLEAN:
            return formatBoolean(value)
        default:
            return formatWithSeparator(value, keyAnalysisDigitGroupSeparator)
    }
}
