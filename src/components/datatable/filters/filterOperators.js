import i18n from '@dhis2/d2-i18n'
import {
    FILTER_TEXT,
    OPERATOR_CONTAINS,
    OPERATOR_IS,
    OPERATOR_NOT_CONTAINS,
    OPERATOR_STARTS_WITH,
} from '../../../constants/dataTable.js'

const getTextOperators = () => [
    { value: OPERATOR_CONTAINS, label: i18n.t('Contains') },
    { value: OPERATOR_NOT_CONTAINS, label: i18n.t('Does not contain') },
    { value: OPERATOR_IS, label: i18n.t('Is') },
    { value: OPERATOR_STARTS_WITH, label: i18n.t('Starts with') },
]

const OPERATORS = {
    [FILTER_TEXT]: getTextOperators,
}

// The conditions offered for a kind of column, the default first
export const getOperators = (filterType) => OPERATORS[filterType]?.() ?? []
