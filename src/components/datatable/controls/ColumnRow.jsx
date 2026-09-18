import i18n from '@dhis2/d2-i18n'
import {
    IconDragHandle16,
    IconLock16,
    IconLockOpen16,
    Tooltip,
} from '@dhis2/ui'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import Checkbox from '../../core/Checkbox.jsx'
import styles from './styles/ColumnPickerControl.module.css'

const noop = () => {}

export const ColumnRowFields = ({
    header,
    isVisible,
    isPinned,
    dragHandleProps,
    dataTestSuffix = '',
    suppressTooltips = false,
    onToggleVisible = noop,
    onTogglePinned = noop,
}) => {
    const dragLabel = i18n.t('Drag to reorder')
    const pinLabel = isPinned
        ? i18n.t('Unpin column')
        : i18n.t('Pin column to the left')

    const dragIcon = <IconDragHandle16 />
    const pinIcon = isPinned ? <IconLock16 /> : <IconLockOpen16 />

    return (
        <>
            <button
                type="button"
                className={cx(styles.rowIconButton, styles.dragHandle)}
                aria-label={dragLabel}
                data-test={`data-table-column-picker-drag-${header.dataKey}${dataTestSuffix}`}
                draggable={false}
                {...dragHandleProps}
            >
                {suppressTooltips ? (
                    dragIcon
                ) : (
                    <Tooltip content={dragLabel} placement="left">
                        {dragIcon}
                    </Tooltip>
                )}
            </button>
            <Checkbox
                label={
                    <span className={styles.columnRowLabel}>{header.name}</span>
                }
                checked={isVisible}
                onChange={(checked) => onToggleVisible(header.dataKey, checked)}
                className={styles.columnRowCheckbox}
                dataTest={`data-table-column-picker-visible-${header.dataKey}${dataTestSuffix}`}
            />
            <button
                type="button"
                className={cx(styles.rowIconButton, styles.pinButton, {
                    [styles.pinButtonActive]: isPinned,
                })}
                aria-label={pinLabel}
                data-test={`data-table-column-picker-pin-${header.dataKey}${dataTestSuffix}`}
                onClick={() => onTogglePinned(header.dataKey)}
            >
                {suppressTooltips ? (
                    pinIcon
                ) : (
                    <Tooltip content={pinLabel} placement="right">
                        {pinIcon}
                    </Tooltip>
                )}
            </button>
        </>
    )
}

ColumnRowFields.propTypes = {
    header: PropTypes.shape({
        dataKey: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,
    isPinned: PropTypes.bool.isRequired,
    isVisible: PropTypes.bool.isRequired,
    dataTestSuffix: PropTypes.string,
    dragHandleProps: PropTypes.object,
    suppressTooltips: PropTypes.bool,
    onTogglePinned: PropTypes.func,
    onToggleVisible: PropTypes.func,
}

const ColumnRow = ({
    header,
    isVisible,
    isPinned,
    isPinnedGroupEnd,
    isDragActive,
    onToggleVisible,
    onTogglePinned,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: header.dataKey })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
        opacity: isDragging ? 0 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cx(styles.columnRow, {
                [styles.columnRowDivider]: isPinnedGroupEnd,
            })}
        >
            <ColumnRowFields
                header={header}
                isVisible={isVisible}
                isPinned={isPinned}
                dragHandleProps={{ ...attributes, ...listeners }}
                suppressTooltips={isDragActive}
                onToggleVisible={onToggleVisible}
                onTogglePinned={onTogglePinned}
            />
        </div>
    )
}

ColumnRow.propTypes = {
    header: PropTypes.shape({
        dataKey: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,
    isDragActive: PropTypes.bool.isRequired,
    isPinned: PropTypes.bool.isRequired,
    isPinnedGroupEnd: PropTypes.bool.isRequired,
    isVisible: PropTypes.bool.isRequired,
    onTogglePinned: PropTypes.func.isRequired,
    onToggleVisible: PropTypes.func.isRequired,
}

export default ColumnRow
