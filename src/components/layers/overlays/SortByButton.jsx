import i18n from '@dhis2/d2-i18n'
import { DropdownButton, FlyoutMenu, MenuItem } from '@dhis2/ui'
import React, { useState } from 'react'

// PROTOTYPE ONLY - purely cosmetic, doesn't actually sort anything
const SORT_OPTIONS = [
    { value: 'name-asc', label: i18n.t('Name asc.') },
    { value: 'name-desc', label: i18n.t('Name desc.') },
    { value: 'type', label: i18n.t('Type') },
]

const SortByButton = () => {
    const [open, setOpen] = useState(false)
    const [sortBy, setSortBy] = useState(SORT_OPTIONS[0])

    return (
        <DropdownButton
            small
            secondary
            open={open}
            onClick={() => setOpen(!open)}
            dataTest="addlayersort"
            component={
                <FlyoutMenu dense>
                    {SORT_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            label={option.label}
                            active={option.value === sortBy.value}
                            onClick={() => {
                                setSortBy(option)
                                setOpen(false)
                            }}
                        />
                    ))}
                </FlyoutMenu>
            }
        >
            {i18n.t('Sort by')}
        </DropdownButton>
    )
}

export default SortByButton
