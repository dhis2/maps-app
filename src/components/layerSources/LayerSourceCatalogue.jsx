import PropTypes from 'prop-types'
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import LayerSourceCard from './LayerSourceCard.jsx'
import {
    MAP_TYPE,
    ORIGIN,
    PERIOD_TYPE,
    RESOLUTION,
    mockCatalogueSources,
} from './mockCatalogueSources.js'
import styles from './styles/LayerSourceCatalogue.module.css'

const DATE_FILTER_MIN = 1940
const DATE_FILTER_MAX = 2025

const ORIGIN_FILTERS = [
    { label: 'All', value: null },
    { label: '★ Favorites', value: '__favorites__' },
    { label: 'Earth Engine', value: ORIGIN.EARTH_ENGINE },
    { label: 'STAC', value: ORIGIN.STAC },
    { label: 'Copernicus CDS', value: ORIGIN.COPERNICUS_CDS },
    { label: 'ArcGIS', value: ORIGIN.ARCGIS },
    { label: 'WMS / TMS / XYZ', value: '__tile__' },
    { label: 'GeoJSON', value: ORIGIN.GEOJSON_URL },
    { label: 'Org / User data', value: '__user__' },
    { label: 'Shared with me', value: ORIGIN.SHARED_WITH_ME },
]

const SIDEBAR_TAGS = [
    'population',
    'climate',
    'health',
    'vegetation',
    'elevation',
    'land cover',
    'boundaries',
    'satellite',
]

const matchesTileOrigin = (origin) => [ORIGIN.WMS, ORIGIN.XYZ].includes(origin)
const matchesUserOrigin = (origin) =>
    [ORIGIN.ORG_DATA, ORIGIN.USER_DATA].includes(origin)

const MAP_TYPE_OPTIONS = [
    { label: 'Layer', value: MAP_TYPE.LAYER },
    { label: 'Basemap', value: MAP_TYPE.BASEMAP },
]

const pct = (year) =>
    ((year - DATE_FILTER_MIN) / (DATE_FILTER_MAX - DATE_FILTER_MIN)) * 100

const LayerSourceCatalogue = ({
    favorites,
    onToggleFavorite,
    onAddToMap,
    sources = mockCatalogueSources,
    onEditSource,
    onDeleteSource,
    initialMapType = null,
}) => {
    const [search, setSearch] = useState('')
    const [activeMapType, setActiveMapType] = useState(initialMapType)
    const [activeChip, setActiveChip] = useState(null)
    const [periodFilters, setPeriodFilters] = useState([])
    const [resolutionFilters, setResolutionFilters] = useState([])
    const [tagFilters, setTagFilters] = useState([])
    const [sortBy, setSortBy] = useState('default')
    const [yearRange, setYearRange] = useState([
        DATE_FILTER_MIN,
        DATE_FILTER_MAX,
    ])
    const [showAllPeriods, setShowAllPeriods] = useState(false)
    const [showAllTags, setShowAllTags] = useState(false)
    const chipsRef = useRef(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const checkChipsScroll = useCallback(() => {
        const el = chipsRef.current
        if (!el) {
            return
        }
        setCanScrollLeft(el.scrollLeft > 0)
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
    }, [])

    useEffect(() => {
        const el = chipsRef.current
        if (!el) {
            return
        }
        checkChipsScroll()
        el.addEventListener('scroll', checkChipsScroll, { passive: true })
        const ro = new ResizeObserver(checkChipsScroll)
        ro.observe(el)
        return () => {
            el.removeEventListener('scroll', checkChipsScroll)
            ro.disconnect()
        }
    }, [checkChipsScroll])

    const scrollChips = (dir) => {
        chipsRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' })
    }

    const toggleFilter = (list, setList, value) => {
        setList(
            list.includes(value)
                ? list.filter((v) => v !== value)
                : [...list, value]
        )
    }

    const dateFilterActive =
        yearRange[0] > DATE_FILTER_MIN || yearRange[1] < DATE_FILTER_MAX

    const filtered = useMemo(() => {
        let result = sources.filter((source) => {
            if (activeMapType && source.mapType !== activeMapType) {
                return false
            }

            if (search) {
                const q = search.toLowerCase()
                if (
                    !source.name.toLowerCase().includes(q) &&
                    !source.description.toLowerCase().includes(q) &&
                    !source.tags.some((t) => t.toLowerCase().includes(q))
                ) {
                    return false
                }
            }

            if (activeChip) {
                if (
                    activeChip === '__favorites__' &&
                    !favorites.has(source.id)
                ) {
                    return false
                }
                if (
                    activeChip === '__tile__' &&
                    !matchesTileOrigin(source.origin)
                ) {
                    return false
                }
                if (
                    activeChip === '__user__' &&
                    !matchesUserOrigin(source.origin)
                ) {
                    return false
                }
                if (
                    activeChip !== '__favorites__' &&
                    activeChip !== '__tile__' &&
                    activeChip !== '__user__' &&
                    source.origin !== activeChip
                ) {
                    return false
                }
            }

            if (
                periodFilters.length > 0 &&
                !periodFilters.includes(source.periodType)
            ) {
                return false
            }
            if (
                resolutionFilters.length > 0 &&
                !resolutionFilters.includes(source.resolution)
            ) {
                return false
            }
            if (
                tagFilters.length > 0 &&
                !tagFilters.every((t) => source.tags.includes(t))
            ) {
                return false
            }

            if (dateFilterActive && source.startYear != null) {
                const srcEnd = source.endYear ?? DATE_FILTER_MAX
                if (srcEnd < yearRange[0] || source.startYear > yearRange[1]) {
                    return false
                }
            }

            return true
        })

        if (sortBy === 'az') {
            result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortBy === 'za') {
            result = [...result].sort((a, b) => b.name.localeCompare(a.name))
        } else if (sortBy === 'origin') {
            result = [...result].sort((a, b) =>
                a.origin.localeCompare(b.origin)
            )
        }

        return result
    }, [
        sources,
        search,
        activeMapType,
        activeChip,
        favorites,
        periodFilters,
        resolutionFilters,
        tagFilters,
        sortBy,
        yearRange,
        dateFilterActive,
    ])

    return (
        <div className={styles.catalogue}>
            <div className={styles.searchRow}>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Search sources by name, description, or tag…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className={styles.chipsWrapper}>
                    {canScrollLeft && (
                        <button
                            className={`${styles.chipScrollBtn} ${styles.chipScrollLeft}`}
                            onClick={() => scrollChips(-1)}
                            aria-label="Scroll left"
                        >
                            ‹
                        </button>
                    )}
                    <div ref={chipsRef} className={styles.chips}>
                        {ORIGIN_FILTERS.map(({ label, value }) => (
                            <button
                                key={label}
                                className={`${styles.chip}${
                                    activeChip === value
                                        ? ` ${styles.active}`
                                        : ''
                                }`}
                                onClick={() =>
                                    setActiveChip(
                                        value === activeChip ? null : value
                                    )
                                }
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {canScrollRight && (
                        <button
                            className={`${styles.chipScrollBtn} ${styles.chipScrollRight}`}
                            onClick={() => scrollChips(1)}
                            aria-label="Scroll right"
                        >
                            ›
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.body}>
                <div className={styles.sidebar}>
                    <div className={styles.filterSection}>
                        <p className={styles.filterSectionTitle}>Map type</p>
                        {MAP_TYPE_OPTIONS.map(({ label, value }) => (
                            <label key={value} className={styles.filterOption}>
                                <input
                                    type="checkbox"
                                    checked={activeMapType === value}
                                    onChange={() =>
                                        setActiveMapType(
                                            activeMapType === value
                                                ? null
                                                : value
                                        )
                                    }
                                />
                                {label}
                            </label>
                        ))}
                    </div>

                    <div className={styles.filterSection}>
                        <p className={styles.filterSectionTitle}>Period type</p>
                        {(showAllPeriods
                            ? Object.values(PERIOD_TYPE)
                            : Object.values(PERIOD_TYPE).slice(0, 4)
                        ).map((pt) => (
                            <label key={pt} className={styles.filterOption}>
                                <input
                                    type="checkbox"
                                    checked={periodFilters.includes(pt)}
                                    onChange={() =>
                                        toggleFilter(
                                            periodFilters,
                                            setPeriodFilters,
                                            pt
                                        )
                                    }
                                />
                                {pt}
                            </label>
                        ))}
                        {Object.values(PERIOD_TYPE).length > 4 && (
                            <button
                                className={styles.showMoreButton}
                                onClick={() => setShowAllPeriods((v) => !v)}
                            >
                                {showAllPeriods ? 'Show less' : 'Show more'}
                            </button>
                        )}
                    </div>

                    <div className={styles.filterSection}>
                        <p className={styles.filterSectionTitle}>Date range</p>
                        <div className={styles.yearRangeValues}>
                            <span>{yearRange[0]}</span>
                            <span>
                                {yearRange[1] >= DATE_FILTER_MAX
                                    ? 'present'
                                    : yearRange[1]}
                            </span>
                        </div>
                        <div className={styles.dualRangeWrapper}>
                            <div className={styles.rangeTrack}>
                                <div
                                    className={styles.rangeFill}
                                    style={{
                                        left: `${pct(yearRange[0])}%`,
                                        right: `${100 - pct(yearRange[1])}%`,
                                    }}
                                />
                            </div>
                            <input
                                type="range"
                                className={styles.rangeInput}
                                min={DATE_FILTER_MIN}
                                max={DATE_FILTER_MAX}
                                value={yearRange[0]}
                                onChange={(e) => {
                                    const val = Math.min(
                                        Number(e.target.value),
                                        yearRange[1] - 1
                                    )
                                    setYearRange([val, yearRange[1]])
                                }}
                            />
                            <input
                                type="range"
                                className={styles.rangeInput}
                                min={DATE_FILTER_MIN}
                                max={DATE_FILTER_MAX}
                                value={yearRange[1]}
                                onChange={(e) => {
                                    const val = Math.max(
                                        Number(e.target.value),
                                        yearRange[0] + 1
                                    )
                                    setYearRange([yearRange[0], val])
                                }}
                            />
                        </div>
                        <div className={styles.yearRangeLabels}>
                            <span>{DATE_FILTER_MIN}</span>
                            <span>present</span>
                        </div>
                        {dateFilterActive && (
                            <button
                                className={styles.resetDateFilter}
                                onClick={() =>
                                    setYearRange([
                                        DATE_FILTER_MIN,
                                        DATE_FILTER_MAX,
                                    ])
                                }
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    <div className={styles.filterSection}>
                        <p className={styles.filterSectionTitle}>Resolution</p>
                        {Object.values(RESOLUTION).map((res) => (
                            <label key={res} className={styles.filterOption}>
                                <input
                                    type="checkbox"
                                    checked={resolutionFilters.includes(res)}
                                    onChange={() =>
                                        toggleFilter(
                                            resolutionFilters,
                                            setResolutionFilters,
                                            res
                                        )
                                    }
                                />
                                {res}
                            </label>
                        ))}
                    </div>

                    <div className={styles.filterSection}>
                        <p className={styles.filterSectionTitle}>Tags</p>
                        <div>
                            {(showAllTags
                                ? SIDEBAR_TAGS
                                : SIDEBAR_TAGS.slice(0, 5)
                            ).map((tag) => (
                                <span
                                    key={tag}
                                    className={`${styles.tagFilterChip}${
                                        tagFilters.includes(tag)
                                            ? ` ${styles.active}`
                                            : ''
                                    }`}
                                    onClick={() =>
                                        toggleFilter(
                                            tagFilters,
                                            setTagFilters,
                                            tag
                                        )
                                    }
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        {SIDEBAR_TAGS.length > 5 && (
                            <button
                                className={styles.showMoreButton}
                                onClick={() => setShowAllTags((v) => !v)}
                            >
                                {showAllTags ? 'Show less' : 'Show more'}
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.cardList}>
                    <div className={styles.cardListHeader}>
                        <p className={styles.resultsCount}>
                            {filtered.length} source
                            {filtered.length !== 1 ? 's' : ''}
                        </p>
                        <div className={styles.sortControl}>
                            <span className={styles.sortLabel}>Sort:</span>
                            <select
                                className={styles.sortSelect}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="default">Default</option>
                                <option value="az">A → Z</option>
                                <option value="za">Z → A</option>
                                <option value="origin">By origin</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.cardListScroll}>
                        {filtered.length === 0 ? (
                            <div className={styles.emptyState}>
                                No sources match your filters.
                            </div>
                        ) : (
                            filtered.map((source) => (
                                <LayerSourceCard
                                    key={source.id}
                                    source={source}
                                    isFavorite={favorites.has(source.id)}
                                    onToggleFavorite={onToggleFavorite}
                                    onAddToMap={onAddToMap}
                                    onEdit={onEditSource}
                                    onDelete={onDeleteSource}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

LayerSourceCatalogue.propTypes = {
    favorites: PropTypes.instanceOf(Set).isRequired,
    onAddToMap: PropTypes.func.isRequired,
    onToggleFavorite: PropTypes.func.isRequired,
    initialMapType: PropTypes.string,
    sources: PropTypes.array,
    onDeleteSource: PropTypes.func,
    onEditSource: PropTypes.func,
}

export default LayerSourceCatalogue
