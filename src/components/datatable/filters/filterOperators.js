import i18n from '@dhis2/d2-i18n'
import {
    OPERATOR_CONTAINS,
    OPERATOR_EQUAL,
    OPERATOR_NOT_EQUAL,
    OPERATOR_GREATER,
    OPERATOR_GREATER_OR_EQUAL,
    OPERATOR_LESS,
    OPERATOR_LESS_OR_EQUAL,
    OPERATOR_BETWEEN,
    OPERATOR_EMPTY,
    OPERATOR_NOT_EMPTY,
} from '../../../constants/dataTable.js'

// Shared by the text, number and date filters; they take no value
export const getEmptyOperators = () => [
    { value: OPERATOR_EMPTY, label: i18n.t('Is empty') },
    { value: OPERATOR_NOT_EMPTY, label: i18n.t('Is not empty') },
]

export const getTextOperators = () => [
    { value: OPERATOR_CONTAINS, label: i18n.t('Contains') },
    ...getEmptyOperators(),
]

export const getNumberOperators = () => [
    { value: OPERATOR_EQUAL, label: i18n.t('Equal to'), symbol: '=' },
    { value: OPERATOR_NOT_EQUAL, label: i18n.t('Not equal to'), symbol: '≠' },
    { value: OPERATOR_GREATER, label: i18n.t('Greater than'), symbol: '>' },
    {
        value: OPERATOR_GREATER_OR_EQUAL,
        label: i18n.t('Greater than or equal to'),
        symbol: '≥',
    },
    { value: OPERATOR_LESS, label: i18n.t('Less than'), symbol: '<' },
    {
        value: OPERATOR_LESS_OR_EQUAL,
        label: i18n.t('Less than or equal to'),
        symbol: '≤',
    },
    { value: OPERATOR_BETWEEN, label: i18n.t('Between') },
    ...getEmptyOperators(),
]
