import { IconChevronLeft24, IconChevronRight24 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { openLayersPanel, closeLayersPanel } from '../../actions/ui.js'
import styles from './styles/LayersToggle.module.css'

// This expand/collapse toggle is separate from LayersPanel to avoid overflow issue
const LayersToggle = ({
    isOpen,
    isDownload,
    openLayersPanel,
    closeLayersPanel,
}) =>
    !isDownload && (
        <div
            onClick={isOpen ? closeLayersPanel : openLayersPanel}
            className={cx(styles.layersToggle, { [styles.collapsed]: !isOpen })}
        >
            {isOpen ? <IconChevronLeft24 /> : <IconChevronRight24 />}
        </div>
    )

LayersToggle.propTypes = {
    closeLayersPanel: PropTypes.func.isRequired,
    isDownload: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    openLayersPanel: PropTypes.func.isRequired,
}

export default connect(
    (state) => ({
        isOpen: state.ui.layersPanelOpen,
        isDownload: state.download.downloadMode,
    }),
    { openLayersPanel, closeLayersPanel }
)(LayersToggle)
