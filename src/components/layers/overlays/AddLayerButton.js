import i18n from '@dhis2/d2-i18n'
import { IconAddCircle24 } from '@dhis2/ui'
import React, { Fragment, useState, useRef } from 'react'
import { MenuButton } from '../../core/index.js'
import AddLayerPopover from './AddLayerPopover.js'
import styles from './styles/AddLayerButton.module.css'

const AddLayerButton = () => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef()
    const toggleDialog = () => setIsOpen(!isOpen)

    return (
        <Fragment>
            <div className={styles.addLayerBtn} ref={buttonRef}>
                <MenuButton onClick={toggleDialog} dataTest="add-layer-button">
                    <span className={styles.btnContent}>
                        <IconAddCircle24 />
                        {i18n.t('Add layer')}
                    </span>
                </MenuButton>
            </div>
            {isOpen && (
                <AddLayerPopover anchorEl={buttonRef} onClose={toggleDialog} />
            )}
        </Fragment>
    )
}

export default AddLayerButton
