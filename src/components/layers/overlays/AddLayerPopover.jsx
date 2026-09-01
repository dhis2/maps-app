import i18n from '@dhis2/d2-i18n'
import { Popover, Input, IconSearch16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addLayer, editLayer } from '../../../actions/layers.js'
import getEarthEngineLayers from '../../../constants/earthEngineLayers/index.js'
import { EXTERNAL_LAYER } from '../../../constants/layers.js'
import { mockLayerSources } from '../../../constants/mockLayerSources.js'
import useAddedLayerSources from '../../../hooks/useAddedLayerSources.js'
import useKeyDown from '../../../hooks/useKeyDown.js'
import useLayerCatalogPrefs from '../../../hooks/useLayerCatalogPrefs.js'
import useManagedLayerSourcesStore from '../../../hooks/useManagedLayerSourcesStore.js'
import { isSplitViewMap } from '../../../util/helpers.js'
import {
    groupLayerSources,
    getLayerSourceId,
    getLayerSourcePlacement,
    matchesLayerSourceFilter,
    PLACEMENT_OVERLAY,
} from '../../../util/layerSources.js'
import { useCachedData } from '../../cachedDataProvider/CachedDataProvider.jsx'
import ManageLayerSourcesButton from '../../layerSources/ManageLayerSourcesButton.jsx'
import LayerList from './LayerList.jsx'
import LayerSourceDetails from './LayerSourceDetails.jsx'
import LayerSourceList from './LayerSourceList.jsx'
import SortByButton from './SortByButton.jsx'
import styles from './styles/AddLayerPopover.module.css'

const includeEarthEngineLayers = (defaultLayerSources, managedLayerSources) => {
    // Earth Engine layers that are added to this DHIS2 instance
    const managedEarthEngineLayers = getEarthEngineLayers().filter(
        (l) => !l.legacy && managedLayerSources.includes(l.layerId)
    )

    // Make copy before slicing below
    const layerSources = [...defaultLayerSources]

    // Insert Earth Engine layers before external layers
    layerSources.splice(5, 0, ...managedEarthEngineLayers)

    // PROTOTYPE ONLY - pad out the catalog so the filter has something to chew on
    return layerSources.concat(mockLayerSources())
}

const AddLayerPopover = ({ anchorEl, onClose, onManaging }) => {
    const isSplitView = useSelector((state) =>
        isSplitViewMap(state.map.mapViews)
    )
    const dispatch = useDispatch()
    const { defaultLayerSources } = useCachedData()
    const { managedLayerSources } = useManagedLayerSourcesStore()
    const { pinnedIds, isPinned, isDisabled, togglePinned, reorderPinned } =
        useLayerCatalogPrefs()
    const { addedSources } = useAddedLayerSources()
    const [filter, setFilter] = useState('')
    // The details sub panel - one open at a time, positioned next to whichever
    // info button opened it
    const [info, setInfo] = useState(null)
    const catalogRef = useRef(null)

    // Basemaps are chosen on the Basemap card, never added as a layer here
    const addedOverlays = addedSources.filter(
        (source) => getLayerSourcePlacement(source) === PLACEMENT_OVERLAY
    )
    const layerSources = includeEarthEngineLayers(
        defaultLayerSources,
        managedLayerSources
    ).concat(addedOverlays)
    const groupedLayerSources = groupLayerSources(layerSources)

    useKeyDown('Escape', () => (info ? setInfo(null) : onClose()))

    const onShowInfo = (layer, event) => {
        const id = getLayerSourceId(layer)
        if (info?.id === id) {
            setInfo(null)
            return
        }
        // Line the panel up with the button that opened it - the panel itself
        // pulls back up if that would push it off the bottom of the window
        const button = event.currentTarget.getBoundingClientRect()
        const catalog = catalogRef.current?.getBoundingClientRect()
        const offset = catalog ? button.top - catalog.top : 0
        setInfo({ id, layer, top: Math.max(0, offset) })
    }

    const onLayerSelect = (layer) => {
        let selectedLayer = layer
        if (layer.items) {
            selectedLayer = layer.items[0]?.items?.[0] || layer.items[0]
            delete selectedLayer.id
        }

        const config = { ...selectedLayer }
        const layerType = selectedLayer.layer

        dispatch(
            layerType === EXTERNAL_LAYER ? addLayer(config) : editLayer(config)
        )

        onClose()
    }

    const onTogglePin = (layer) => togglePinned(getLayerSourceId(layer))

    const onFilterChange = (value) => {
        setFilter(value)
        setInfo(null)
    }

    // Sources switched off in the manage dialog never show up here
    const enabledLayerSources = groupedLayerSources.filter(
        (layer) => !isDisabled(getLayerSourceId(layer))
    )
    // Pinned tiles follow the order they were dragged into, not the catalog's
    const pinnedLayerSources = enabledLayerSources
        .filter((layer) => isPinned(getLayerSourceId(layer)))
        .sort(
            (a, b) =>
                pinnedIds.indexOf(getLayerSourceId(a)) -
                pinnedIds.indexOf(getLayerSourceId(b))
        )
    const otherLayerSources = enabledLayerSources
        .filter((layer) => !isPinned(getLayerSourceId(layer)))
        .filter((layer) => matchesLayerSourceFilter(layer, filter))

    return (
        <Popover
            arrow={false}
            reference={anchorEl}
            placement="bottom-start"
            maxWidth={700}
            onClickOutside={onClose}
            dataTest="addlayerpopover"
            className={styles.popover}
        >
            {isSplitView ? (
                <LayerList
                    layers={groupedLayerSources}
                    isSplitView={isSplitView}
                    onLayerSelect={onLayerSelect}
                />
            ) : (
                <div className={styles.catalog} ref={catalogRef}>
                    {pinnedLayerSources.length > 0 && (
                        <div className={styles.pinnedZone}>
                            <LayerList
                                variant="pinned"
                                layers={pinnedLayerSources}
                                onLayerSelect={onLayerSelect}
                                isPinned={isPinned}
                                onTogglePin={onTogglePin}
                                onReorder={reorderPinned}
                            />
                        </div>
                    )}
                    <div className={styles.listZone}>
                        <div className={styles.zoneHeader}>
                            <div className={styles.filter}>
                                <Input
                                    dense
                                    type="text"
                                    prefixIcon={<IconSearch16 />}
                                    clearable
                                    value={filter}
                                    placeholder={i18n.t(
                                        'Filter {{count}} available layers',
                                        {
                                            count: enabledLayerSources.length,
                                        }
                                    )}
                                    onChange={({ value }) =>
                                        onFilterChange(value)
                                    }
                                    dataTest="addlayerfilter"
                                />
                            </div>
                            <SortByButton />
                            <ManageLayerSourcesButton onClick={onManaging} />
                        </div>
                        <LayerSourceList
                            layers={otherLayerSources}
                            onLayerSelect={onLayerSelect}
                            isPinned={isPinned}
                            onTogglePin={onTogglePin}
                            onShowInfo={onShowInfo}
                            infoLayerId={info?.id}
                            onScroll={() => setInfo(null)}
                        />
                    </div>
                    {info && (
                        <LayerSourceDetails
                            key={info.id}
                            layer={info.layer}
                            top={info.top}
                            onClose={() => setInfo(null)}
                            onSelect={onLayerSelect}
                        />
                    )}
                </div>
            )}
        </Popover>
    )
}

AddLayerPopover.propTypes = {
    onClose: PropTypes.func.isRequired,
    onManaging: PropTypes.func.isRequired,
    anchorEl: PropTypes.object,
}

export default AddLayerPopover
