import i18n from '@dhis2/d2-i18n'
import { IconVisualizationColumnMulti16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { FilterDropdownPopover } from '../FilterDropdownPopover.jsx'
import styles from './styles/JoinLayersControl.module.css'
import ToolbarIconButton from './ToolbarIconButton.jsx'

const JoinLayersControl = ({ eligibleLayers, selectedIds, onChange }) => {
    const anchorRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    const onToggle = (layerId) =>
        onChange(
            selectedIds.includes(layerId)
                ? selectedIds.filter((id) => id !== layerId)
                : [...selectedIds, layerId]
        )

    return (
        <>
            <ToolbarIconButton
                ref={anchorRef}
                tooltip={i18n.t('Choose layers to combine')}
                ariaLabel={i18n.t('Choose layers to combine')}
                dataTest="data-table-join-layers-button"
                disabled={!eligibleLayers.length}
                onClick={() => setIsOpen((o) => !o)}
            >
                <IconVisualizationColumnMulti16 />
            </ToolbarIconButton>
            {isOpen && (
                <FilterDropdownPopover
                    reference={anchorRef}
                    placement="top-start"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.joinLayersPopover}>
                        {eligibleLayers.map((layer) => (
                            <label key={layer.id} className={styles.layerRow}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(layer.id)}
                                    onChange={() => onToggle(layer.id)}
                                />
                                <span className={styles.layerName}>
                                    {layer.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </FilterDropdownPopover>
            )}
        </>
    )
}

JoinLayersControl.propTypes = {
    eligibleLayers: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
        })
    ).isRequired,
    selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
}

export default JoinLayersControl
