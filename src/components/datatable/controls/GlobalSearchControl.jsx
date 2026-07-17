import i18n from '@dhis2/d2-i18n'
import { Input, Tooltip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/GlobalSearchControl.module.css'

const GlobalSearchControl = ({ value, onChange }) => (
    <Tooltip
        content={i18n.t('Search across all visible columns')}
        placement="top"
    >
        <div
            className={styles.globalSearch}
            onDoubleClick={(e) => e.stopPropagation()}
        >
            <Input
                dense
                dataTest="data-table-global-search"
                placeholder={i18n.t('Search all columns')}
                value={value}
                onChange={({ value }) => onChange(value)}
            />
        </div>
    </Tooltip>
)

GlobalSearchControl.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
}

export default GlobalSearchControl
