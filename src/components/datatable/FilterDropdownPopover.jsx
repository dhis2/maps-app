import { Layer, Popper } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'

const ESTIMATED_POPOVER_HEIGHT = 340 // Rough popover height used to flip the dropdown when there isn't room to open downward

const dropdownModifiers = [
    { name: 'offset', options: { offset: [0, 0] } },
    { name: 'flip', enabled: false },
]

export const getDropdownPlacement = (anchorRect) => {
    const dropdownSide =
        anchorRect != null &&
        window.innerHeight - anchorRect.bottom < ESTIMATED_POPOVER_HEIGHT
            ? 'top'
            : 'bottom'
    return {
        dropdownSide,
        dropdownPlacement: `${dropdownSide}-start`,
        tooltipPlacement: dropdownSide === 'top' ? 'bottom' : 'top',
    }
}

export const FilterDropdownPopover = ({
    reference,
    placement,
    onClickOutside,
    className,
    children,
}) => (
    <Layer onBackdropClick={onClickOutside}>
        <Popper
            placement={placement}
            reference={reference}
            modifiers={dropdownModifiers}
            className={className}
        >
            {children}
        </Popper>
    </Layer>
)

FilterDropdownPopover.propTypes = {
    children: PropTypes.node.isRequired,
    placement: PropTypes.oneOf(['top-start', 'bottom-start']).isRequired,
    reference: PropTypes.object.isRequired,
    onClickOutside: PropTypes.func.isRequired,
    className: PropTypes.string,
}
