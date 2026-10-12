import i18n from '@dhis2/d2-i18n'
import { Button, IconCross16, Tooltip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch } from 'react-redux'
import { closeDataTable } from '../../../actions/dataTable.js'
import LayerSwitcher from './LayerSwitcher.jsx'
import styles from './styles/DataTableToolbar.module.css'

const DataTableToolbar = ({ onColumnsClick }) => {
    const dispatch = useDispatch()

    return (
        <div className={styles.toolbar} data-test="data-table-toolbar">
            <div className={styles.start}>
                <LayerSwitcher />
            </div>
            <div className={styles.end}>
                {onColumnsClick && (
                    <>
                        <Button
                            small
                            secondary
                            onClick={onColumnsClick}
                            dataTest="data-table-columns-button"
                        >
                            {i18n.t('Columns')}
                        </Button>
                        <span className={styles.divider} />
                    </>
                )}
                <Tooltip content={i18n.t('Close data table')} placement="top">
                    <button
                        className={styles.iconButton}
                        onClick={() => dispatch(closeDataTable())}
                        aria-label={i18n.t('Close data table')}
                        data-test="data-table-close"
                    >
                        <IconCross16 />
                    </button>
                </Tooltip>
            </div>
        </div>
    )
}

DataTableToolbar.propTypes = {
    onColumnsClick: PropTypes.func,
}

export default DataTableToolbar
