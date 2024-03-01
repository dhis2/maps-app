import { IconChevronLeft24, IconChevronRight24 } from '@dhis2/ui'
import cx from 'classnames'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { openLayersPanel, closeLayersPanel } from '../../actions/ui.js'
import styles from './styles/LayersToggle.module.css'

const LayersToggle = () => {
    const dispatch = useDispatch()
    const isOpen = useSelector((state) => state.ui.layersPanelOpen)
    const isDownload = useSelector((state) => state.ui.downloadMode)

    return (
        !isDownload && (
            <div
                data-test="layers-toggle-button"
                onClick={
                    isOpen
                        ? () => dispatch(closeLayersPanel())
                        : () => dispatch(openLayersPanel())
                }
                className={cx(styles.layersToggle, {
                    [styles.collapsed]: !isOpen,
                })}
            >
                {isOpen ? <IconChevronLeft24 /> : <IconChevronRight24 />}
            </div>
        )
    )
}

export default LayersToggle
