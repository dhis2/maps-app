import { Popover } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addLayer, editLayer } from '../../../actions/layers.js'
import { EXTERNAL_LAYER } from '../../../constants/layers.js'
import useKeyDown from '../../../hooks/useKeyDown.js'
import { isSplitViewMap } from '../../../util/helpers.js'
import { groupLayerSources } from '../../../util/layerSources.js'
import { useCachedData } from '../../cachedDataProvider/CachedDataProvider.jsx'
import { mockCatalogueSources } from '../../layerSources/mockCatalogueSources.js'
import { useFavorites } from '../../layerSources/mockFavoritesStore.js'
import LayerList from './LayerList.jsx'
import styles from './styles/AddLayerPopover.module.css'

const FAVORITES_SEARCH_THRESHOLD = 5

const AddLayerPopover = ({ anchorEl, onClose, onManaging }) => {
    const isSplitView = useSelector((state) =>
        isSplitViewMap(state.map.mapViews)
    )
    const dispatch = useDispatch()
    const { defaultLayerSources } = useCachedData()

    // Built-in layer types (first 5 entries before any EE layers are spliced in)
    const builtInTypes = groupLayerSources(defaultLayerSources.slice(0, 5))

    const [favorites] = useFavorites()
    const [favSearch, setFavSearch] = useState('')
    const [favSort, setFavSort] = useState('most-used')

    const allFavorites = useMemo(
        () =>
            Array.from(favorites)
                .map((id) => mockCatalogueSources.find((s) => s.id === id))
                .filter(Boolean),
        [favorites]
    )

    const displayedFavorites = useMemo(() => {
        const list = favSearch
            ? allFavorites.filter(
                  (s) =>
                      s.name.toLowerCase().includes(favSearch.toLowerCase()) ||
                      s.origin.toLowerCase().includes(favSearch.toLowerCase())
              )
            : [...allFavorites]
        if (favSort === 'az') {
            list.sort((a, b) => a.name.localeCompare(b.name))
        }
        if (favSort === 'za') {
            list.sort((a, b) => b.name.localeCompare(a.name))
        }
        if (favSort === 'origin') {
            list.sort((a, b) => a.origin.localeCompare(b.origin))
        }
        return list
    }, [allFavorites, favSearch, favSort])

    useKeyDown('Escape', onClose)

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

    const onFavoriteSelect = () => {
        onClose()
    }

    return (
        <Popover
            arrow={false}
            reference={anchorEl}
            placement="bottom-start"
            maxWidth={590}
            onClickOutside={onClose}
            dataTest="addlayerpopover"
        >
            {/* Built-in layer types */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>
                        Built-in layer types
                    </span>
                </div>
                <LayerList
                    layers={builtInTypes}
                    isSplitView={isSplitView}
                    onLayerSelect={onLayerSelect}
                />
            </div>

            {/* Favorites */}
            {!isSplitView && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>★ Favorites</span>
                        <button
                            className={styles.manageLink}
                            onClick={onManaging}
                        >
                            Manage →
                        </button>
                    </div>

                    <div className={styles.favoritesControls}>
                        {allFavorites.length > FAVORITES_SEARCH_THRESHOLD && (
                            <div className={styles.favoritesSearch}>
                                <input
                                    className={styles.favoritesSearchInput}
                                    type="text"
                                    placeholder="Search favorites…"
                                    value={favSearch}
                                    onChange={(e) =>
                                        setFavSearch(e.target.value)
                                    }
                                />
                            </div>
                        )}
                        <select
                            className={styles.sortSelect}
                            value={favSort}
                            onChange={(e) => setFavSort(e.target.value)}
                        >
                            <option value="most-used">Most used</option>
                            <option value="az">A → Z</option>
                            <option value="za">Z → A</option>
                            <option value="origin">By origin</option>
                        </select>
                    </div>

                    <div className={styles.favoritesList}>
                        {displayedFavorites.length === 0 ? (
                            <div className={styles.emptyFavorites}>
                                {allFavorites.length === 0
                                    ? 'No favorites yet — star sources in the catalogue.'
                                    : 'No favorites match your search.'}
                            </div>
                        ) : (
                            displayedFavorites.map((source) => (
                                <div
                                    key={source.id}
                                    className={styles.favoriteRow}
                                    onClick={() => onFavoriteSelect(source)}
                                >
                                    <img
                                        src={source.img}
                                        className={styles.favoriteThumb}
                                        alt=""
                                    />
                                    <div className={styles.favoriteInfo}>
                                        <div className={styles.favoriteName}>
                                            {source.name}
                                        </div>
                                        <div className={styles.favoriteOrigin}>
                                            {source.origin}
                                        </div>
                                    </div>
                                    <span className={styles.favoriteAdd}>
                                        +
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
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
