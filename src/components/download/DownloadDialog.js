import i18n from '@dhis2/d2-i18n'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    toggleDownloadDialog,
    toggleDownloadShowName,
    toggleDownloadShowLegend,
    setDownloadLegendPosition,
} from '../../actions/download.js'
import { downloadMapImage, downloadSupport } from '../../util/export-image.js'
import { Checkbox } from '../core/index.js'
import LegendPosition from './LegendPosition.js'
import styles from './styles/DownloadDialog.module.css'

export class DownloadDialog extends Component {
    static propTypes = {
        hasLegend: PropTypes.bool.isRequired,
        hasName: PropTypes.bool.isRequired,
        legendPosition: PropTypes.string.isRequired,
        setDownloadLegendPosition: PropTypes.func.isRequired,
        showDialog: PropTypes.bool.isRequired,
        showLegend: PropTypes.bool.isRequired,
        showName: PropTypes.bool.isRequired,
        toggleDownloadDialog: PropTypes.func.isRequired,
        toggleDownloadShowLegend: PropTypes.func.isRequired,
        toggleDownloadShowName: PropTypes.func.isRequired,
    }

    state = {
        error: null,
    }

    render() {
        const {
            showDialog,
            hasName,
            showName,
            hasLegend,
            showLegend,
            legendPosition,
            toggleDownloadShowName,
            toggleDownloadShowLegend,
            setDownloadLegendPosition,
        } = this.props

        if (!showDialog) {
            return null
        }

        const isSupported = downloadSupport() && !this.state.error

        return (
            <Modal position="middle" small onClose={this.onClose}>
                <ModalTitle>{i18n.t('Download map')}</ModalTitle>
                <ModalContent>
                    <div className={styles.modalContent}>
                        {isSupported ? (
                            <Fragment>
                                <Checkbox
                                    label={i18n.t('Show name')}
                                    checked={showName}
                                    disabled={!hasName}
                                    onChange={toggleDownloadShowName}
                                />
                                <Checkbox
                                    label={i18n.t('Show legend')}
                                    checked={showLegend}
                                    disabled={!hasLegend}
                                    onChange={toggleDownloadShowLegend}
                                />
                                {hasLegend && showLegend && (
                                    <LegendPosition
                                        position={legendPosition}
                                        onChange={setDownloadLegendPosition}
                                    />
                                )}
                            </Fragment>
                        ) : (
                            i18n.t(
                                'Map download is not supported by your browser. Try Google Chrome or Firefox.'
                            )
                        )}
                    </div>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip end>
                        <Button secondary onClick={this.onClose}>
                            {isSupported ? i18n.t('Cancel') : i18n.t('Close')}
                        </Button>
                        {isSupported && (
                            <Button primary onClick={this.onDownload}>
                                {i18n.t('Download')}
                            </Button>
                        )}
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        )
    }

    onClose = () => this.props.toggleDownloadDialog(false)

    onDownload = () => {
        const mapEl = document.getElementById('dhis2-map-container')

        const filename = `map-${Math.random().toString(36).substring(7)}.png`

        downloadMapImage(mapEl, filename).then(this.onClose).catch(this.onError)
    }

    onError = (error) => {
        this.setState({ error })
    }
}

export default connect(
    (state) => ({
        hasName: state.map.name !== undefined,
        hasLegend:
            state.map.mapViews.filter((layer) => layer.legend).length > 0,
        ...state.download,
    }),
    {
        toggleDownloadDialog,
        toggleDownloadShowName,
        toggleDownloadShowLegend,
        setDownloadLegendPosition,
    }
)(DownloadDialog)
