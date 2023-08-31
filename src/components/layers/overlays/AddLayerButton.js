import i18n from '@dhis2/d2-i18n'
import { IconAddCircle24 } from '@dhis2/ui'
import React, { useState, useRef } from 'react'
import AddLayerPopover from './AddLayerPopover.js'
import styles from './styles/AddLayerButton.module.css'

const AddLayerButton = () => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef()
    const toggleDialog = () => setIsOpen(!isOpen)

    return (
        <>
            <div className={styles.container} ref={buttonRef}>
                <button
                    className={styles.button}
                    onClick={toggleDialog}
                    data-test="add-layer-button"
                >
                    <span className={styles.content}>
                        <IconAddCircle24 />
                        <span>{i18n.t('Add layer')}</span>
                    </span>
                </button>
            </div>
            {isOpen && (
                <AddLayerPopover anchorEl={buttonRef} onClose={toggleDialog} />
            )}
        </>
    )
}

export default AddLayerButton
