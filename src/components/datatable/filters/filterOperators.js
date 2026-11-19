import i18n from '@dhis2/d2-i18n'
import {
    FILTER_DATE,
    FILTER_NUMBER,
    FILTER_TEXT,
    FILTER_TIME,
    OPERATOR_AFTER,
    OPERATOR_BEFORE,
    OPERATOR_BETWEEN,
    OPERATOR_ON,
    OPERATOR_CONTAINS,
    OPERATOR_EQUAL,
    OPERATOR_FIND,
    OPERATOR_GREATER,
    OPERATOR_GREATER_OR_EQUAL,
    OPERATOR_IS,
    OPERATOR_LESS,
    OPERATOR_LESS_OR_EQUAL,
    OPERATOR_NOT_CONTAINS,
    OPERATOR_NOT_EQUAL,
    OPERATOR_STARTS_WITH,
} from '../../../constants/dataTable.js'

const getTextOperators = () => [
    { value: OPERATOR_CONTAINS, label: i18n.t('Contains') },
    { value: OPERATOR_NOT_CONTAINS, label: i18n.t('Does not contain') },
    { value: OPERATOR_IS, label: i18n.t('Is') },
    { value: OPERATOR_STARTS_WITH, label: i18n.t('Starts with') },
]

const getNumberOperators = () => [
    { value: OPERATOR_BETWEEN, label: i18n.t('Between') },
    { value: OPERATOR_EQUAL, label: i18n.t('Equal to (=)') },
    { value: OPERATOR_NOT_EQUAL, label: i18n.t('Not equal to (≠)') },
    { value: OPERATOR_GREATER, label: i18n.t('Greater than (>)') },
    {
        value: OPERATOR_GREATER_OR_EQUAL,
        label: i18n.t('Greater than or equal to (≥)'),
    },
    { value: OPERATOR_LESS, label: i18n.t('Less than (<)') },
    {
        value: OPERATOR_LESS_OR_EQUAL,
        label: i18n.t('Less than or equal to (≤)'),
    },
]

// Between includes both ends; Before and After exclude the date or time typed
const getDateOperators = () => [
    { value: OPERATOR_BETWEEN, label: i18n.t('Between') },
    { value: OPERATOR_ON, label: i18n.t('On') },
    { value: OPERATOR_BEFORE, label: i18n.t('Before') },
    { value: OPERATOR_AFTER, label: i18n.t('After') },
]

const getTimeOperators = () => [
    { value: OPERATOR_BETWEEN, label: i18n.t('Between') },
    { value: OPERATOR_ON, label: i18n.t('At') },
    { value: OPERATOR_BEFORE, label: i18n.t('Before') },
    { value: OPERATOR_AFTER, label: i18n.t('After') },
]

const OPERATORS = {
    [FILTER_TEXT]: getTextOperators,
    [FILTER_NUMBER]: getNumberOperators,
    [FILTER_DATE]: getDateOperators,
    [FILTER_TIME]: getTimeOperators,
}

// "Find in list" comes last on text columns: never the default, the text is never saved
const getFindOperator = () => ({
    value: OPERATOR_FIND,
    label: i18n.t('Find in list'),
})

// The conditions offered for a kind of column, the default first
export const getOperators = (filterType) => {
    const operators = OPERATORS[filterType]?.() ?? []
    return filterType === FILTER_TEXT
        ? [...operators, getFindOperator()]
        : operators
}
