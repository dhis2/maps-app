import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip } from '@dhis2/ui'
import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    toggleDownloadMode,
    toggleDownloadShowName,
    toggleDownloadShowLegend,
} from '../../actions/download.js'
import { downloadMapImage, downloadSupport } from '../../util/export-image.js'
import Drawer from '../core/Drawer.js'
import { Checkbox } from '../core/index.js'
import styles from './styles/DownloadDialog.module.css'

const DownloadDialog = () => {
    const [error, setError] = useState(null)
    const dispatch = useDispatch()

    const { mapViews, name: mapName } = useSelector((state) => state.map)
    const { downloadMode, showName, showLegend } = useSelector(
        (state) => state.download
    )

    const hasLegend = useMemo(
        () => mapViews.filter((layer) => layer.legend).length > 0,
        [mapViews]
    )

    const hasName = mapName !== undefined

    if (!downloadMode) {
        return null
    }

    const isSupported = downloadSupport() && !error

    const onClose = () => dispatch(toggleDownloadMode(false))

    const onDownload = () => {
        const mapEl = document.getElementById('dhis2-map-container')

        const filename = `map-${Math.random().toString(36).substring(7)}.png`

        downloadMapImage(mapEl, filename).then(onClose).catch(setError)
    }

    return (
        <Drawer position="left">
            <div className={styles.downloadDialog}>
                <h2>{i18n.t('Download map')}</h2>
                <div className={styles.modalContent}>
                    {isSupported ? (
                        <>
                            <Checkbox
                                label={i18n.t('Show name')}
                                checked={showName}
                                disabled={!hasName}
                                onChange={(v) =>
                                    dispatch(toggleDownloadShowName(v))
                                }
                            />
                            <Checkbox
                                label={i18n.t('Show legend')}
                                checked={showLegend}
                                disabled={!hasLegend}
                                onChange={(v) =>
                                    dispatch(toggleDownloadShowLegend(v))
                                }
                            />
                        </>
                    ) : (
                        i18n.t(
                            'Map download is not supported by your browser. Try Google Chrome or Firefox.'
                        )
                    )}
                </div>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {isSupported ? i18n.t('Cancel') : i18n.t('Close')}
                    </Button>
                    {isSupported && (
                        <Button primary onClick={onDownload}>
                            {i18n.t('Download')}
                        </Button>
                    )}
                </ButtonStrip>
            </div>
        </Drawer>
    )
}

export default DownloadDialog
