import i18n from '@dhis2/d2-i18n'
import {
    OPERATOR_CONTAINS,
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
