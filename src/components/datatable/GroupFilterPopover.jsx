import i18n from '@dhis2/d2-i18n'
import {
    Input,
    IconChevronRight16,
    IconChevronDown16,
    IconFilter16,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Virtuoso } from 'react-virtuoso'
import {
    OPTION_ROW_HEIGHT,
    MAX_LIST_HEIGHT,
    toHighlightedIndex,
} from '../../util/filterInput.js'
import Checkbox from '../core/Checkbox.jsx'
import { FilterDropdownPopover } from './FilterDropdownPopover.jsx'
import FilterHelpTooltip from './FilterHelpTooltip.jsx'
import styles from './styles/FilterInput.module.css'

const GROUP_POPOVER_WIDTH = 220
const HELP_HEIGHT = 56
const INDENT_PX = 16

const GroupFilterPopover = ({
    name,
    helpContent,
    customFilterTag,
    formatLabel,
    anchorRef,
    listRef,
    dropdownPlacement,
    dropdownSide,
    tooltipPlacement,
    isOpen,
    searchText,
    highlightedIndex,
    displayValue,
    visibleNodes,
    showCustomFilterRow,
    anyValueActive,
    notSetActive,
    hasNotSetOption,
    effectiveExpanded,
    checkStateFor,
    openPopover,
    closePopover,
    onSearchChange,
    onSearchKeyDown,
    onApplyCustomFilterClick,
    onToggleExpand,
    onToggleNode,
    onToggleAnyValue,
    onToggleNotSet,
}) => (
    <div className={styles.filterTrigger} ref={anchorRef}>
        <FilterHelpTooltip
            content={helpContent}
            placement={tooltipPlacement}
            estimatedHeight={HELP_HEIGHT}
            dataTest="data-table-filter-help"
        >
            <Input
                dense
                clearable
                dataTest={`data-table-column-filter-search-${name}`}
                placeholder={i18n.t('Search')}
                value={displayValue}
                onFocus={() => {
                    if (!isOpen) {
                        openPopover()
                    }
                }}
                onChange={onSearchChange}
                onKeyDown={onSearchKeyDown}
            />
        </FilterHelpTooltip>
        {isOpen && (
            <FilterDropdownPopover
                reference={anchorRef}
                placement={dropdownPlacement}
                onClickOutside={closePopover}
                className={cx(
                    styles.dropdownPopper,
                    dropdownSide === 'top' && styles.dropdownPopperAbove
                )}
            >
                <div
                    className={cx(styles.searchableFilterPopover, {
                        [styles.reversedOrder]: dropdownSide === 'top',
                    })}
                    style={{ width: `${GROUP_POPOVER_WIDTH}px` }}
                >
                    {showCustomFilterRow && (
                        <button
                            type="button"
                            className={cx(styles.customFilterRow, {
                                [styles.highlighted]: highlightedIndex === 0,
                            })}
                            data-test={`data-table-column-filter-custom-${name}`}
                            onClick={onApplyCustomFilterClick}
                        >
                            <IconFilter16 />
                            <span className={styles.customFilterTag}>
                                {customFilterTag}
                            </span>
                            <span className={styles.customFilterExpr}>
                                {searchText.trim()}
                            </span>
                        </button>
                    )}
                    <div className={styles.pinnedOptions}>
                        <Checkbox
                            label={i18n.t('Any value')}
                            checked={anyValueActive}
                            onChange={onToggleAnyValue}
                            className={cx(
                                styles.specialOption,
                                styles.denseCheckbox
                            )}
                            dataTest={`data-table-column-filter-any-${name}`}
                        />
                        {hasNotSetOption && (
                            <Checkbox
                                label={i18n.t('No value')}
                                checked={notSetActive}
                                onChange={onToggleNotSet}
                                className={cx(
                                    styles.specialOption,
                                    styles.denseCheckbox
                                )}
                                dataTest={`data-table-column-filter-novalue-${name}`}
                            />
                        )}
                    </div>
                    <div className={styles.multiSelectPopover}>
                        {!showCustomFilterRow && visibleNodes.length === 0 && (
                            <div className={styles.noResults}>
                                {i18n.t('No matches')}
                            </div>
                        )}
                        {visibleNodes.length > 0 && (
                            <Virtuoso
                                ref={listRef}
                                style={{
                                    height: Math.min(
                                        visibleNodes.length * OPTION_ROW_HEIGHT,
                                        MAX_LIST_HEIGHT
                                    ),
                                }}
                                increaseViewportBy={{
                                    top: 0,
                                    bottom: OPTION_ROW_HEIGHT * 2,
                                }}
                                data={visibleNodes}
                                fixedItemHeight={OPTION_ROW_HEIGHT}
                                computeItemKey={(_, { node }) => node.key}
                                itemContent={(index, { node, depth }) => {
                                    const state = checkStateFor(node)
                                    const checked = state === 'checked'
                                    const indeterminate =
                                        state === 'indeterminate'
                                    const isExpanded = effectiveExpanded.has(
                                        node.key
                                    )
                                    const label = formatLabel(node)
                                    return (
                                        <div
                                            className={styles.treeRow}
                                            style={{
                                                paddingLeft: depth * INDENT_PX,
                                            }}
                                        >
                                            {node.children.length > 0 ? (
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.expandButton
                                                    }
                                                    onClick={() =>
                                                        onToggleExpand(node.key)
                                                    }
                                                    aria-label={
                                                        isExpanded
                                                            ? i18n.t(
                                                                  'Collapse {{label}}',
                                                                  { label }
                                                              )
                                                            : i18n.t(
                                                                  'Expand {{label}}',
                                                                  { label }
                                                              )
                                                    }
                                                >
                                                    {isExpanded ? (
                                                        <IconChevronDown16 />
                                                    ) : (
                                                        <IconChevronRight16 />
                                                    )}
                                                </button>
                                            ) : (
                                                <span
                                                    className={
                                                        styles.expandButtonPlaceholder
                                                    }
                                                />
                                            )}
                                            <Checkbox
                                                label={label}
                                                checked={checked}
                                                indeterminate={indeterminate}
                                                onChange={() =>
                                                    onToggleNode(node)
                                                }
                                                className={cx(
                                                    styles.denseCheckbox,
                                                    highlightedIndex ===
                                                        toHighlightedIndex(
                                                            index,
                                                            showCustomFilterRow
                                                        ) && styles.highlighted
                                                )}
                                            />
                                        </div>
                                    )
                                }}
                            />
                        )}
                    </div>
                </div>
            </FilterDropdownPopover>
        )}
    </div>
)

GroupFilterPopover.propTypes = {
    anchorRef: PropTypes.object.isRequired,
    anyValueActive: PropTypes.bool.isRequired,
    checkStateFor: PropTypes.func.isRequired,
    closePopover: PropTypes.func.isRequired,
    customFilterTag: PropTypes.string.isRequired,
    displayValue: PropTypes.string.isRequired,
    effectiveExpanded: PropTypes.instanceOf(Set).isRequired,
    formatLabel: PropTypes.func.isRequired,
    hasNotSetOption: PropTypes.bool.isRequired,
    helpContent: PropTypes.node.isRequired,
    highlightedIndex: PropTypes.number.isRequired,
    isOpen: PropTypes.bool.isRequired,
    listRef: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    notSetActive: PropTypes.bool.isRequired,
    openPopover: PropTypes.func.isRequired,
    searchText: PropTypes.string.isRequired,
    showCustomFilterRow: PropTypes.bool.isRequired,
    visibleNodes: PropTypes.array.isRequired,
    onApplyCustomFilterClick: PropTypes.func.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    onSearchKeyDown: PropTypes.func.isRequired,
    onToggleAnyValue: PropTypes.func.isRequired,
    onToggleExpand: PropTypes.func.isRequired,
    onToggleNode: PropTypes.func.isRequired,
    onToggleNotSet: PropTypes.func.isRequired,
    dropdownPlacement: PropTypes.string,
    dropdownSide: PropTypes.string,
    tooltipPlacement: PropTypes.string,
}

export default GroupFilterPopover
