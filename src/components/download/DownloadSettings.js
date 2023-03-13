import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip } from '@dhis2/ui'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setDownloadMode, setDownloadConfig } from '../../actions/download.js'
import { standardizeFilename } from '../../util/dataDownload.js'
import { downloadMapImage, downloadSupport } from '../../util/export-image.js'
import { getSplitViewLayer } from '../../util/helpers.js'
import { getMapName } from '../app/FileMenu.js'
import Drawer from '../core/Drawer.js'
import { Checkbox, Help } from '../core/index.js'
import LegendLayers from './LegendLayers.js'
import NorthArrowPosition from './NorthArrowPosition.js'
import styles from './styles/DownloadSettings.module.css'

const DownloadSettings = () => {
    const [error, setError] = useState(null)
    const dispatch = useDispatch()

    const { mapViews, name, description } = useSelector((state) => state.map)
    const {
        showName,
        showDescription,
        showLegend,
        showInLegend,
        showOverviewMap,
        hasOverviewMapSpace,
        showNorthArrow,
        northArrowPosition,
        includeMargins,
    } = useSelector((state) => state.download)

    const legendLayers = useMemo(
        () => mapViews.filter((layer) => layer.legend),
        [mapViews]
    )

    const onClose = useCallback(
        () => dispatch(setDownloadMode(false)),
        [dispatch]
    )

    const onDownload = useCallback(() => {
        const filename = standardizeFilename(getMapName(name), 'png')
        let mapEl = document.getElementById('dhis2-map-container')

        if (includeMargins) {
            mapEl = mapEl.parentNode
        }

        downloadMapImage(mapEl, filename).catch(setError)
    }, [name, includeMargins])

    const hasLayers = mapViews.length > 0

    useEffect(() => {
        // Set default values
        dispatch(
            setDownloadConfig({
                showName: !!name,
                showDescription: !!description,
                showLegend: !!legendLayers.length,
                showInLegend: legendLayers.map((l) => l.id),
                showOverviewMap: hasLayers,
            })
        )
    }, [name, description, legendLayers, hasLayers, dispatch])

    const isSupported = downloadSupport() && !error
    const isSplitView = !!getSplitViewLayer(mapViews)
    const showMarginsCheckbox = false // Not in use

    return (
        <Drawer position="left">
            <div className={styles.downloadSettings}>
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
                                        setDownloadConfig({ showName: value })
                                    )
                                }
                            />
                            <Checkbox
                                label={i18n.t('Show map description')}
                                checked={showDescription}
                                disabled={!description}
                                onChange={(value) =>
                                    dispatch(
                                        setDownloadConfig({
                                            showDescription: value,
                                        })
                                    )
                                }
                                tooltip={
                                    description
                                        ? i18n.t(
                                              'Description can be changed from File > Rename menu'
                                          )
                                        : i18n.t(
                                              'Set the map description when you save the map or from File > Rename menu'
                                          )
                                }
                            />
                            <Checkbox
                                label={i18n.t('Show legend')}
                                checked={showLegend}
                                disabled={!legendLayers.length}
                                onChange={(value) =>
                                    dispatch(
                                        setDownloadConfig({
                                            showLegend: value,
                                        })
                                    )
                                }
                            />
                            {showLegend && legendLayers.length > 1 && (
                                <LegendLayers
                                    layers={legendLayers}
                                    show={showInLegend}
                                />
                            )}
                            <Checkbox
                                label={i18n.t('Show overview map')}
                                checked={showOverviewMap}
                                disabled={!hasOverviewMapSpace}
                                onChange={(value) =>
                                    dispatch(
                                        setDownloadConfig({
                                            showOverviewMap: value,
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
                                        setDownloadConfig({
                                            showNorthArrow: value,
                                        })
                                    )
                                }
                            />
                            {showNorthArrow && (
                                <NorthArrowPosition
                                    position={northArrowPosition}
                                    onChange={(value) =>
                                        dispatch(
                                            setDownloadConfig({
                                                northArrowPosition: value,
                                            })
                                        )
                                    }
                                />
                            )}
                            {showMarginsCheckbox && (
                                <Checkbox
                                    label={i18n.t(
                                        'Include margins in download'
                                    )}
                                    checked={includeMargins}
                                    onChange={(value) =>
                                        dispatch(
                                            setDownloadConfig({
                                                includeMargins: value,
                                            })
                                        )
                                    }
                                />
                            )}
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
                <div className={styles.buttons}>
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
            </div>
        </Drawer>
    )
}

export default DownloadSettings
