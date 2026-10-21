import i18n from '@dhis2/d2-i18n'
import {
    Button,
    IconChevronDown16,
    IconChevronUp16,
    IconCross16,
    Tooltip,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch } from 'react-redux'
import { closeDataTable } from '../../../actions/dataTable.js'
import LayerSwitcher from './LayerSwitcher.jsx'
import styles from './styles/DataTableToolbar.module.css'

const DataTableToolbar = ({ collapsed, onColumnsClick, onCollapseToggle }) => {
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
                {onCollapseToggle && (
                    <Tooltip
                        content={
                            collapsed
                                ? i18n.t('Expand data table')
                                : i18n.t('Collapse data table')
                        }
                        placement="top"
                    >
                        <button
                            className={styles.iconButton}
                            onClick={onCollapseToggle}
                            aria-label={
                                collapsed
                                    ? i18n.t('Expand data table')
                                    : i18n.t('Collapse data table')
                            }
                            aria-expanded={!collapsed}
                            data-test="data-table-collapse"
                        >
                            {collapsed ? (
                                <IconChevronUp16 />
                            ) : (
                                <IconChevronDown16 />
                            )}
                        </button>
                    </Tooltip>
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
    collapsed: PropTypes.bool,
    onCollapseToggle: PropTypes.func,
    onColumnsClick: PropTypes.func,
}

export default DataTableToolbar
