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

export const NO_VALUE_TEXT = '—'

export const formatCellText = (
    value,
    { renderer, type, orgUnitIdToName, keyAnalysisDigitGroupSeparator } = {}
) => {
    if (value == null) {
        return NO_VALUE_TEXT
    }
    if (renderer === RENDERER_COLOR) {
        return value.toLowerCase()
    }
    if (renderer === RENDERER_DATE) {
        return type === TYPE_DATE ? formatDate(value) : formatDatetime(value)
    }
    if (renderer === RENDERER_ORG_UNIT) {
        return formatOrgUnitPathBreadcrumb(value, orgUnitIdToName)
    }
    if (renderer === RENDERER_ORG_UNIT_NAME) {
        return formatOrgUnitOwnName(value, orgUnitIdToName)
    }
    if (renderer === RENDERER_BOOLEAN) {
        return formatBoolean(value)
    }
    return formatWithSeparator(value, keyAnalysisDigitGroupSeparator)
}
