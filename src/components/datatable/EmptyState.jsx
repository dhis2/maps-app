import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/EmptyState.module.css'

// Shown in place of the table body when there are no rows to list
const EmptyState = ({ hasFilters, onClearFilters }) => (
    <div className={styles.emptyState} data-test="data-table-empty-state">
        <p className={styles.title}>
            {hasFilters
                ? i18n.t('No matching rows')
                : i18n.t('No data to show')}
        </p>
        <p className={styles.description}>
            {hasFilters
                ? i18n.t('Try changing or clearing your filters.')
                : i18n.t('This layer has no features with data.')}
        </p>
        {hasFilters && (
            <Button
                small
                secondary
                onClick={onClearFilters}
                dataTest="data-table-empty-clear-filters"
            >
                {i18n.t('Clear filters')}
            </Button>
        )}
    </div>
)

EmptyState.propTypes = {
    hasFilters: PropTypes.bool,
    onClearFilters: PropTypes.func,
}

export default EmptyState
