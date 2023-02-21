import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip } from '@dhis2/ui'
import React, { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    toggleDownloadMode,
    setDownloadProperty,
} from '../../actions/download.js'
import { downloadMapImage, downloadSupport } from '../../util/export-image.js'
import { getSplitViewLayer } from '../../util/helpers.js'
import Drawer from '../core/Drawer.js'
import { Checkbox, Help } from '../core/index.js'
import NorthArrowPosition from './NorthArrowPosition.js'
import styles from './styles/DownloadDialog.module.css'

const DownloadDialog = () => {
    const [error, setError] = useState(null)
    const dispatch = useDispatch()

    const { mapViews, name, description } = useSelector((state) => state.map)
    const {
        showName,
        showDescription,
        showLegend,
        showInsetMap,
        showNorthArrow,
        northArrowPosition,
        includeMargins,
    } = useSelector((state) => state.download)

    const hasLegend = useMemo(
        () => mapViews.filter((layer) => layer.legend).length > 0,
        [mapViews]
    )

    const hasLayers = mapViews.length > 0

    useEffect(() => {
        // Set default values
        dispatch(
            setDownloadProperty({
                showName: !!name,
                showDescription: !!description,
                showLegend: hasLegend,
                showInsetMap: hasLayers,
            })
        )
    }, [name, description, hasLegend, hasLayers, dispatch])

    const isSupported = downloadSupport() && !error
    const isSplitView = !!getSplitViewLayer(mapViews)

    const onClose = () => dispatch(toggleDownloadMode(false))

    const onDownload = () => {
        const filename = `map-${Math.random().toString(36).substring(7)}.png`
        let mapEl = document.getElementById('dhis2-map-container')

        if (includeMargins) {
            mapEl = mapEl.parentNode
        }

        downloadMapImage(mapEl, filename).then(onClose).catch(setError)
    }

    return (
        <Drawer position="left">
            <div className={styles.downloadDialog}>
                <h2>{i18n.t('Download map')}</h2>
                <div className={styles.dialogContent}>
                    {isSupported ? (
                        <>
                            <Checkbox
                                label={i18n.t('Show map name')}
                                checked={showName}
                                disabled={!name}
                                onChange={(value) =>
                                    dispatch(
                                        setDownloadProperty({ showName: value })
                                    )
                                }
                            />
                            <Checkbox
                                label={i18n.t('Show map description')}
                                checked={showDescription}
                                disabled={!description}
                                onChange={(value) =>
                                    dispatch(
                                        setDownloadProperty({
                                            showDescription: value,
                                        })
                                    )
                                }
                            />
                            <Help>
                                {description
                                    ? i18n.t(
                                          'Change the map description under File > Rename.'
                                      )
                                    : i18n.t(
                                          'Set the map description when you save the map or under File > Rename.'
                                      )}
                            </Help>
                            <Checkbox
                                label={i18n.t('Show legend')}
                                checked={showLegend}
                                disabled={!hasLegend}
                                onChange={(value) =>
                                    dispatch(
                                        setDownloadProperty({
                                            showLegend: value,
                                        })
                                    )
                                }
                            />
                            <Checkbox
                                label={i18n.t('Show inset map')}
                                checked={showInsetMap}
                                onChange={(value) =>
                                    dispatch(
                                        setDownloadProperty({
                                            showInsetMap: value,
                                        })
                                    )
                                }
                            />
                            <Checkbox
                                label={i18n.t('Show north arrow')}
                                checked={showNorthArrow}
                                disabled={isSplitView}
                                onChange={(value) =>
                                    dispatch(
                                        setDownloadProperty({
                                            showNorthArrow: value,
                                        })
                                    )
                                }
                            />
                            {showNorthArrow && (
                                <NorthArrowPosition
                                    position={northArrowPosition}
                                    // onChange={(v) =>dispatch(setDownloadLegendPosition(v))}
                                    onChange={(value) =>
                                        dispatch(
                                            setDownloadProperty({
                                                northArrowPosition: value,
                                            })
                                        )
                                    }
                                />
                            )}
                            <Checkbox
                                label={i18n.t('Include margins in download')}
                                checked={includeMargins}
                                onChange={(value) =>
                                    dispatch(
                                        setDownloadProperty({
                                            includeMargins: value,
                                        })
                                    )
                                }
                            />
                            <Help>
                                {i18n.t(
                                    'Resize your browser window to change the map dimensions.'
                                )}
                            </Help>
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
