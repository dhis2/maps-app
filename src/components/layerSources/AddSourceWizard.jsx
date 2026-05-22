import { Button, ButtonStrip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import getEarthEngineLayers from '../../constants/earthEngineLayers/index.js'
import { ORIGIN } from './mockCatalogueSources.js'
import styles from './styles/AddSourceWizard.module.css'

const ORIGIN_TO_TYPE_ID = {
    [ORIGIN.EARTH_ENGINE]: 'ee-preset',
    [ORIGIN.STAC]: 'stac',
    [ORIGIN.COPERNICUS_CDS]: 'copernicus',
    [ORIGIN.ARCGIS]: 'arcgis',
    [ORIGIN.WMS]: 'wms',
    [ORIGIN.XYZ]: 'xyz',
    [ORIGIN.GEOJSON_URL]: 'geojson-url',
    [ORIGIN.ORG_DATA]: 'org-data',
    [ORIGIN.USER_DATA]: 'user-data',
}

// layerOnly: true means this source type cannot be used as a basemap
const SOURCE_TYPES = [
    // OGC / Open standards
    {
        id: 'wms',
        label: 'WMS',
        subLabel: 'Web Map Service',
        icon: '🔲',
        adminOnly: true,
        layerOnly: false,
    },
    {
        id: 'wmts',
        label: 'WMTS',
        subLabel: 'Web Map Tile Service',
        icon: '🗃️',
        adminOnly: true,
        layerOnly: false,
    },
    {
        id: 'wfs',
        label: 'WFS',
        subLabel: 'Web Feature Service',
        icon: '🔷',
        adminOnly: true,
        layerOnly: true,
    },
    {
        id: 'ogc-api-features',
        label: 'OGC API Features',
        subLabel: 'Features API / WFS 3',
        icon: '🌐',
        adminOnly: true,
        layerOnly: true,
    },
    {
        id: 'mvt',
        label: 'Vector Tiles',
        subLabel: 'Mapbox / MVT',
        icon: '🎨',
        adminOnly: true,
        layerOnly: false,
    },
    {
        id: 'xyz',
        label: 'TMS / XYZ',
        subLabel: 'Raster tile layer',
        icon: '🧩',
        adminOnly: true,
        layerOnly: false,
    },
    {
        id: 'cog',
        label: 'COG',
        subLabel: 'Cloud-Optimized GeoTIFF',
        icon: '🖼️',
        adminOnly: true,
        layerOnly: true,
    },
    {
        id: 'stac',
        label: 'STAC Catalogue',
        subLabel: 'WorldPop, Sentinel…',
        icon: '📡',
        adminOnly: true,
        layerOnly: true,
    },
    {
        id: 'geojson-url',
        label: 'GeoJSON URL',
        subLabel: 'Remote file',
        icon: '📄',
        adminOnly: true,
        layerOnly: true,
    },
    {
        id: 'qms',
        label: 'QuickMapServices',
        subLabel: 'NextGIS catalog',
        icon: '🔍',
        adminOnly: true,
        layerOnly: false,
    },
    // Curated data services
    {
        id: 'copernicus',
        label: 'Copernicus CDS',
        subLabel: 'Climate Data Store',
        icon: '🌤️',
        adminOnly: true,
        layerOnly: true,
    },
    {
        id: 'climate-api',
        label: 'Climate API',
        subLabel: 'DHIS2 internal service',
        icon: '🌡️',
        adminOnly: true,
        layerOnly: true,
    },
    // Commercial vendors
    {
        id: 'arcgis',
        label: 'ArcGIS',
        subLabel: 'Feature / Map Service',
        icon: '🗺️',
        adminOnly: true,
        layerOnly: false,
    },
    {
        id: 'ee-preset',
        label: 'Earth Engine',
        subLabel: 'Preset dataset',
        icon: '🌍',
        adminOnly: false,
        layerOnly: true,
    },
    {
        id: 'ee-custom',
        label: 'Earth Engine',
        subLabel: 'Custom asset',
        icon: '⚙️',
        adminOnly: true,
        layerOnly: true,
    },
    // Org / Personal data
    {
        id: 'org-data',
        label: 'Org data',
        subLabel: 'Draw or upload',
        icon: '✏️',
        adminOnly: true,
        layerOnly: true,
    },
    {
        id: 'user-data',
        label: 'Personal data',
        subLabel: 'Draw, upload or share',
        icon: '👤',
        adminOnly: false,
        layerOnly: true,
    },
    {
        id: 'shared-with-me',
        label: 'Shared with me',
        subLabel: 'From other users',
        icon: '👥',
        adminOnly: false,
        layerOnly: true,
    },
]

const SOURCE_TYPE_BY_ID = Object.fromEntries(SOURCE_TYPES.map((t) => [t.id, t]))

const GROUPS = [
    {
        label: 'OGC / Open standards',
        ids: [
            'cog',
            'geojson-url',
            'mvt',
            'ogc-api-features',
            'qms',
            'stac',
            'wfs',
            'wms',
            'wmts',
            'xyz',
        ],
    },
    {
        label: 'Curated data services',
        ids: ['climate-api', 'copernicus'],
    },
    {
        label: 'Cloud GIS platforms',
        ids: ['arcgis', 'ee-custom', 'ee-preset'],
    },
    {
        label: 'Org / Personal data',
        ids: ['org-data', 'user-data', 'shared-with-me'],
    },
]

const STEPS = ['Choose type', 'Configure', 'Name & style']

const MOCK_TAGS = [
    'population',
    'climate',
    'health',
    'global',
    'local',
    'annual',
    'monthly',
]

const EE_PRESETS = getEarthEngineLayers()
    .filter((l) => !l.legacy)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 12)

const MOCK_SHARED_SOURCES = [
    {
        id: 'sh1',
        name: 'District catchment areas',
        owner: 'Alice Smith',
        type: 'GeoJSON',
        date: 'Jun 2024',
    },
    {
        id: 'sh2',
        name: 'Vaccination coverage zones',
        owner: 'Mohammed Al-Hassan',
        type: 'GeoJSON',
        date: 'Jul 2024',
    },
    {
        id: 'sh3',
        name: 'Custom admin boundaries 2024',
        owner: 'GIS Team',
        type: 'GeoJSON',
        date: 'Aug 2024',
    },
    {
        id: 'sh4',
        name: 'Health facility service areas',
        owner: 'Nguyen Thi Lan',
        type: 'GeoJSON',
        date: 'Sep 2024',
    },
]

const MOCK_USERS = [
    'Alice Smith',
    'Mohammed Al-Hassan',
    'Nguyen Thi Lan',
    'Sarah Johnson',
]
const MOCK_GROUPS = [
    'GIS Team',
    'National Analytics',
    'Public Health Division',
    'Regional Coordinators',
]

const QMS_MOCK = [
    {
        id: 1,
        name: 'OpenStreetMap Standard',
        type: 'TMS',
        group: 'OpenStreetMap',
    },
    { id: 2, name: 'OSM Humanitarian', type: 'TMS', group: 'OpenStreetMap' },
    { id: 3, name: 'OpenTopoMap', type: 'TMS', group: 'Topography' },
    { id: 4, name: 'Stamen Terrain', type: 'TMS', group: 'Stamen' },
    { id: 5, name: 'Stamen Toner', type: 'TMS', group: 'Stamen' },
    { id: 6, name: 'CartoDB Positron', type: 'TMS', group: 'CartoDB' },
    { id: 7, name: 'CartoDB Dark Matter', type: 'TMS', group: 'CartoDB' },
    { id: 8, name: 'Esri World Imagery', type: 'TMS', group: 'Esri' },
    { id: 9, name: 'Esri World Street Map', type: 'TMS', group: 'Esri' },
    { id: 10, name: 'Bing Maps Aerial', type: 'TMS', group: 'Microsoft' },
    { id: 11, name: 'Google Maps', type: 'TMS', group: 'Google' },
    { id: 12, name: 'Google Satellite', type: 'TMS', group: 'Google' },
]

const MOCK_PERSONAL_QUOTA = {
    total: 5 * 1e6,
    used: 2.1 * 1e6,
    layerSize: 0.4 * 1e6,
}

const MOCK_ORG_QUOTA = {
    total: 1 * 1e9,
    used: 340 * 1e6,
    layerSize: 12.8 * 1e6,
}

const formatBytes = (bytes) => {
    if (bytes >= 1e9) {
        return `${(bytes / 1e9).toFixed(1)} GB`
    }
    if (bytes >= 1e6) {
        return `${(bytes / 1e6).toFixed(1)} MB`
    }
    return `${(bytes / 1e3).toFixed(0)} KB`
}

const QuotaBar = ({ label, used, total, layerSize }) => {
    const otherUsed = Math.max(used - layerSize, 0)
    const otherPct = Math.min((otherUsed / total) * 100, 100)
    const layerPct = Math.min((layerSize / total) * 100, 100 - otherPct)
    const totalPct = otherPct + layerPct
    const isCritical = totalPct > 90
    const isWarning = !isCritical && totalPct > 75
    return (
        <div className={styles.quotaSection}>
            <div className={styles.quotaHeader}>
                <span className={styles.quotaLabel}>{label}</span>
                <span className={styles.quotaNumbers}>
                    {formatBytes(used)} / {formatBytes(total)} used
                </span>
            </div>
            <div className={styles.quotaBar}>
                <div
                    className={`${styles.quotaFillOther}${
                        isCritical
                            ? ` ${styles.quotaFillCritical}`
                            : isWarning
                            ? ` ${styles.quotaFillWarning}`
                            : ''
                    }`}
                    style={{ width: `${otherPct}%` }}
                />
                <div
                    className={styles.quotaFillCurrent}
                    style={{ width: `${layerPct}%` }}
                />
            </div>
            <div className={styles.quotaLegend}>
                <span className={styles.quotaLegendItem}>
                    <span className={styles.quotaLegendDotOther} />
                    Other layers: {formatBytes(otherUsed)}
                </span>
                <span className={styles.quotaLegendItem}>
                    <span className={styles.quotaLegendDotCurrent} />
                    This layer: <strong>{formatBytes(layerSize)}</strong>
                </span>
            </div>
        </div>
    )
}

QuotaBar.propTypes = {
    label: PropTypes.string.isRequired,
    layerSize: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    used: PropTypes.number.isRequired,
}

const ConfigStep = ({ sourceTypeId }) => {
    const [url, setUrl] = useState('')
    const [layerName, setLayerName] = useState('')
    const [assetId, setAssetId] = useState('')
    const [selectedPreset, setSelectedPreset] = useState('')
    const [stacExpanded, setStacExpanded] = useState(false)
    const [cdsExpanded, setCdsExpanded] = useState(false)
    const [apiKey, setApiKey] = useState('')
    const [qmsSearch, setQmsSearch] = useState('')
    const [qmsSelected, setQmsSelected] = useState(null)
    const [sharingMode, setSharingMode] = useState('private')
    const [sharedUsers, setSharedUsers] = useState([])
    const [sharedGroups, setSharedGroups] = useState([])
    const [sharedSearch, setSharedSearch] = useState('')
    const [sharedSelected, setSharedSelected] = useState(null)

    if (sourceTypeId === 'ee-preset') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        Earth Engine dataset
                    </label>
                    <select
                        className={styles.fieldInput}
                        value={selectedPreset}
                        onChange={(e) => setSelectedPreset(e.target.value)}
                    >
                        <option value="">— Select a dataset —</option>
                        {EE_PRESETS.map((l) => (
                            <option key={l.layerId} value={l.layerId}>
                                {l.name}
                            </option>
                        ))}
                    </select>
                    <span className={styles.fieldHint}>
                        Only non-legacy Earth Engine datasets are listed.
                    </span>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'ee-custom') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>GEE asset ID</label>
                    <input
                        className={styles.fieldInput}
                        placeholder="e.g. projects/my-project/assets/my-layer"
                        value={assetId}
                        onChange={(e) => setAssetId(e.target.value)}
                    />
                    <span className={styles.fieldHint}>
                        The asset must be publicly shared or the service account
                        must have read access.
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Band / property</label>
                    <span className={styles.disabledButton}>
                        Browse bands (connect asset first)
                    </span>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'arcgis') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        ArcGIS service URL
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://services.arcgis.com/…/FeatureServer/0"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Discover layers</label>
                    <span className={styles.disabledButton}>
                        Browse ArcGIS catalogue (coming soon)
                    </span>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'stac') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        STAC endpoint URL
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://worldpop.data.gov.uk/stac"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <span className={styles.fieldHint}>
                        Supports STAC Catalogue and STAC Collection endpoints.
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Collections</label>
                    <div className={styles.mockTree}>
                        <div
                            className={`${styles.mockTreeItem}${
                                stacExpanded ? ` ${styles.expanded}` : ''
                            }`}
                            onClick={() => setStacExpanded(!stacExpanded)}
                        >
                            {stacExpanded ? '▼' : '▶'} WorldPop STAC
                        </div>
                        {stacExpanded && (
                            <>
                                <div className={styles.mockTreeChild}>
                                    📦 Global Mosaic 100m (2000–2020)
                                </div>
                                <div className={styles.mockTreeChild}>
                                    📦 Age &amp; Sex Structure 2020
                                </div>
                                <div className={styles.mockTreeChild}>
                                    📦 Urban Change 2000–2015
                                </div>
                                <div className={styles.mockTreeChild}>
                                    📦 Population Density 2000–2030
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'copernicus') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>CDS API key</label>
                    <input
                        className={styles.fieldInput}
                        type="password"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <span className={styles.fieldHint}>
                        Obtain your key at cds.climate.copernicus.eu → Profile →
                        API key.
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Dataset</label>
                    <div className={styles.mockTree}>
                        <div
                            className={`${styles.mockTreeItem}${
                                cdsExpanded ? ` ${styles.expanded}` : ''
                            }`}
                            onClick={() => setCdsExpanded(!cdsExpanded)}
                        >
                            {cdsExpanded ? '▼' : '▶'} Copernicus Climate Data
                            Store
                        </div>
                        {cdsExpanded && (
                            <>
                                <div className={styles.mockTreeChild}>
                                    📦 ERA5 — Monthly averaged data on single
                                    levels
                                </div>
                                <div className={styles.mockTreeChild}>
                                    📦 ERA5 — Hourly data on pressure levels
                                </div>
                                <div className={styles.mockTreeChild}>
                                    📦 ERA5-Land — Monthly averaged data
                                </div>
                                <div className={styles.mockTreeChild}>
                                    📦 CERRA — Regional reanalysis for Europe
                                </div>
                                <div className={styles.mockTreeChild}>
                                    📦 Seasonal forecast — Monthly statistics
                                </div>
                            </>
                        )}
                    </div>
                    <span className={styles.fieldHint}>
                        Protocol: CDS API. STAC endpoints available for select
                        datasets.
                    </span>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'qms') {
        const results = QMS_MOCK.filter(
            (s) =>
                !qmsSearch ||
                s.name.toLowerCase().includes(qmsSearch.toLowerCase()) ||
                s.group.toLowerCase().includes(qmsSearch.toLowerCase())
        )
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        Search QuickMapServices catalog
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="e.g. OpenStreetMap, satellite, terrain…"
                        value={qmsSearch}
                        onChange={(e) => setQmsSearch(e.target.value)}
                    />
                    <span className={styles.fieldHint}>
                        Searching{' '}
                        <a
                            href="https://qms.nextgis.com"
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--colors-blue600)' }}
                        >
                            qms.nextgis.com
                        </a>{' '}
                        — {results.length} result
                        {results.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <div className={styles.qmsList}>
                        {results.map((s) => (
                            <div
                                key={s.id}
                                className={`${styles.qmsRow}${
                                    qmsSelected === s.id
                                        ? ` ${styles.qmsSelected}`
                                        : ''
                                }`}
                                onClick={() => setQmsSelected(s.id)}
                            >
                                <div className={styles.qmsRowName}>
                                    {s.name}
                                </div>
                                <div className={styles.qmsRowMeta}>
                                    {s.group} · {s.type}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'wfs') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        WFS GetCapabilities URL
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://example.org/wfs?SERVICE=WFS&REQUEST=GetCapabilities"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        Type name (layer)
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="e.g. ns:health_facilities"
                        value={layerName}
                        onChange={(e) => setLayerName(e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Version</label>
                    <select className={styles.fieldInput} defaultValue="2.0.0">
                        <option value="1.0.0">1.0.0</option>
                        <option value="1.1.0">1.1.0</option>
                        <option value="2.0.0">2.0.0</option>
                    </select>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        CQL filter{' '}
                        <span
                            style={{
                                fontWeight: 400,
                                color: 'var(--colors-grey600)',
                            }}
                        >
                            (optional)
                        </span>
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="e.g. type = 'hospital'"
                    />
                    <span className={styles.fieldHint}>
                        OGC Common Query Language expression to filter features.
                    </span>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'wmts') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        WMTS GetCapabilities URL
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://example.org/wmts?SERVICE=WMTS&REQUEST=GetCapabilities"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Layer</label>
                    <div className={styles.mockTree}>
                        <div
                            className={`${styles.mockTreeItem}${
                                stacExpanded ? ` ${styles.expanded}` : ''
                            }`}
                            onClick={() => setStacExpanded(!stacExpanded)}
                        >
                            {stacExpanded ? '▼' : '▶'} Available layers
                        </div>
                        {stacExpanded && (
                            <>
                                <div className={styles.mockTreeChild}>
                                    🗺️ ortho_2023 — Orthophoto 2023
                                </div>
                                <div className={styles.mockTreeChild}>
                                    🗺️ admin_boundaries — Administrative
                                    boundaries
                                </div>
                                <div className={styles.mockTreeChild}>
                                    🗺️ hillshade — Terrain hillshade
                                </div>
                            </>
                        )}
                    </div>
                    <span className={styles.fieldHint}>
                        Enter the URL above to browse available layers.
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Tile matrix set</label>
                    <select
                        className={styles.fieldInput}
                        defaultValue="GoogleMapsCompatible"
                    >
                        <option value="GoogleMapsCompatible">
                            GoogleMapsCompatible (EPSG:3857)
                        </option>
                        <option value="EPSG:4326">
                            EPSG:4326 (geographic)
                        </option>
                        <option value="EPSG:25832">EPSG:25832 (UTM 32N)</option>
                    </select>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'ogc-api-features') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        API landing page URL
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://example.org/ogcapi"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <span className={styles.fieldHint}>
                        OGC API Features root endpoint. The service must support
                        JSON output.
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Collection</label>
                    <div className={styles.mockTree}>
                        <div
                            className={`${styles.mockTreeItem}${
                                cdsExpanded ? ` ${styles.expanded}` : ''
                            }`}
                            onClick={() => setCdsExpanded(!cdsExpanded)}
                        >
                            {cdsExpanded ? '▼' : '▶'} Collections
                        </div>
                        {cdsExpanded && (
                            <>
                                <div className={styles.mockTreeChild}>
                                    ⬡ health_facilities
                                </div>
                                <div className={styles.mockTreeChild}>
                                    ⬡ admin_boundaries_level2
                                </div>
                                <div className={styles.mockTreeChild}>
                                    ⬡ waterbodies
                                </div>
                                <div className={styles.mockTreeChild}>
                                    ⬡ roads_primary
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        Filter{' '}
                        <span
                            style={{
                                fontWeight: 400,
                                color: 'var(--colors-grey600)',
                            }}
                        >
                            (optional CQL2)
                        </span>
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="e.g. type = 'hospital' AND capacity > 50"
                    />
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'mvt') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        Tile URL template
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://tile.example.org/{z}/{x}/{y}.pbf"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <span className={styles.fieldHint}>
                        Use {'{z}'}, {'{x}'}, {'{y}'} placeholders. Tiles must
                        be served as <code>application/x-protobuf</code>.
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        Mapbox GL style URL{' '}
                        <span
                            style={{
                                fontWeight: 400,
                                color: 'var(--colors-grey600)',
                            }}
                        >
                            (optional)
                        </span>
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://example.org/style.json"
                    />
                    <span className={styles.fieldHint}>
                        Provide a GL style JSON to control layer rendering. If
                        omitted a default style will be applied.
                    </span>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'cog') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>COG URL</label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://example.org/data/elevation.tif"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <span className={styles.fieldHint}>
                        Cloud-Optimized GeoTIFF must be publicly accessible via
                        HTTP range requests.
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Band</label>
                    <span className={styles.disabledButton}>
                        Inspect bands (connect URL first)
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Colour ramp</label>
                    <span className={styles.disabledButton}>
                        Configure colour ramp (not implemented in mockup)
                    </span>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'climate-api') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        Climate API endpoint
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://dhis2.org/api/climate"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <span className={styles.fieldHint}>
                        Internal DHIS2 Climate API. Contact your system
                        administrator for the endpoint URL.
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Dataset</label>
                    <div className={styles.mockTree}>
                        <div
                            className={`${styles.mockTreeItem}${
                                cdsExpanded ? ` ${styles.expanded}` : ''
                            }`}
                            onClick={() => setCdsExpanded(!cdsExpanded)}
                        >
                            {cdsExpanded ? '▼' : '▶'} Climate variables
                        </div>
                        {cdsExpanded && (
                            <>
                                <div className={styles.mockTreeChild}>
                                    🌡️ Temperature (2m) — daily / monthly
                                </div>
                                <div className={styles.mockTreeChild}>
                                    🌧️ Precipitation — daily / monthly
                                </div>
                                <div className={styles.mockTreeChild}>
                                    💨 Relative humidity — daily
                                </div>
                                <div className={styles.mockTreeChild}>
                                    ☀️ Solar radiation — daily
                                </div>
                                <div className={styles.mockTreeChild}>
                                    🌊 NDVI / Vegetation index — monthly
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'wms') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        WMS GetCapabilities URL
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://example.org/wms?SERVICE=WMS&REQUEST=GetCapabilities"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Layer name</label>
                    <input
                        className={styles.fieldInput}
                        placeholder="e.g. health_facilities"
                        value={layerName}
                        onChange={(e) => setLayerName(e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Version</label>
                    <select className={styles.fieldInput} defaultValue="1.3.0">
                        <option value="1.1.1">1.1.1</option>
                        <option value="1.3.0">1.3.0</option>
                    </select>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'xyz') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        Tile URL template
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://tile.example.org/{z}/{x}/{y}.png"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <span className={styles.fieldHint}>
                        Use {'{z}'}, {'{x}'}, {'{y}'} placeholders for zoom and
                        tile coordinates.
                    </span>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'geojson-url') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>GeoJSON URL</label>
                    <input
                        className={styles.fieldInput}
                        placeholder="https://example.org/data/boundaries.geojson"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <span className={styles.fieldHint}>
                        The URL must be publicly accessible or return
                        CORS-enabled responses.
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Preview</label>
                    <div
                        className={styles.mockTree}
                        style={{
                            height: 80,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        Enter URL to preview
                    </div>
                </div>
            </div>
        )
    }

    if (sourceTypeId === 'org-data') {
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Source</label>
                    <div
                        style={{ display: 'flex', gap: 'var(--spacers-dp12)' }}
                    >
                        <span className={styles.disabledButton}>
                            ✏️ Draw on map
                        </span>
                        <label className={styles.uploadLabel}>
                            📁 Upload GeoJSON
                            <input
                                type="file"
                                accept=".geojson,application/json"
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    <span className={styles.fieldHint}>
                        Stored in the organisation data store and visible to all
                        users.
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Download</label>
                    <label className={styles.radioLabel}>
                        <input type="checkbox" defaultChecked />
                        Allow users to download this data as GeoJSON
                    </label>
                </div>
                <QuotaBar
                    label="Org storage"
                    used={MOCK_ORG_QUOTA.used}
                    total={MOCK_ORG_QUOTA.total}
                    layerSize={MOCK_ORG_QUOTA.layerSize}
                />
            </div>
        )
    }

    if (sourceTypeId === 'user-data') {
        const availableUsers = MOCK_USERS.filter(
            (u) => !sharedUsers.includes(u)
        )
        const availableGroups = MOCK_GROUPS.filter(
            (g) => !sharedGroups.includes(g)
        )
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Source</label>
                    <div
                        style={{ display: 'flex', gap: 'var(--spacers-dp12)' }}
                    >
                        <span className={styles.disabledButton}>
                            ✏️ Draw on map
                        </span>
                        <label className={styles.uploadLabel}>
                            📁 Upload GeoJSON
                            <input
                                type="file"
                                accept=".geojson,application/json"
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Sharing</label>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="sharingMode"
                                value="private"
                                checked={sharingMode === 'private'}
                                onChange={() => setSharingMode('private')}
                            />
                            Private — only visible to you
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="sharingMode"
                                value="shared"
                                checked={sharingMode === 'shared'}
                                onChange={() => setSharingMode('shared')}
                            />
                            Share with specific users or groups
                        </label>
                    </div>
                </div>

                {sharingMode === 'shared' && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Users</label>
                            <div className={styles.tagRow}>
                                {sharedUsers.map((u) => (
                                    <span key={u} className={styles.tagChip}>
                                        {u}
                                        <button
                                            className={styles.tagChipRemove}
                                            onClick={() =>
                                                setSharedUsers(
                                                    sharedUsers.filter(
                                                        (x) => x !== u
                                                    )
                                                )
                                            }
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {availableUsers.length > 0 && (
                                    <select
                                        style={{
                                            border: 'none',
                                            fontSize: 12,
                                            color: 'var(--colors-grey600)',
                                            cursor: 'pointer',
                                        }}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setSharedUsers([
                                                    ...sharedUsers,
                                                    e.target.value,
                                                ])
                                            }
                                            e.target.value = ''
                                        }}
                                    >
                                        <option value="">+ Add user</option>
                                        {availableUsers.map((u) => (
                                            <option key={u} value={u}>
                                                {u}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                                User groups
                            </label>
                            <div className={styles.tagRow}>
                                {sharedGroups.map((g) => (
                                    <span key={g} className={styles.tagChip}>
                                        {g}
                                        <button
                                            className={styles.tagChipRemove}
                                            onClick={() =>
                                                setSharedGroups(
                                                    sharedGroups.filter(
                                                        (x) => x !== g
                                                    )
                                                )
                                            }
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {availableGroups.length > 0 && (
                                    <select
                                        style={{
                                            border: 'none',
                                            fontSize: 12,
                                            color: 'var(--colors-grey600)',
                                            cursor: 'pointer',
                                        }}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setSharedGroups([
                                                    ...sharedGroups,
                                                    e.target.value,
                                                ])
                                            }
                                            e.target.value = ''
                                        }}
                                    >
                                        <option value="">+ Add group</option>
                                        {availableGroups.map((g) => (
                                            <option key={g} value={g}>
                                                {g}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                                Recipients can
                            </label>
                            <label className={styles.radioLabel}>
                                <input type="checkbox" defaultChecked />
                                Download this data as GeoJSON
                            </label>
                            <label className={styles.radioLabel}>
                                <input type="checkbox" />
                                Re-share with others
                            </label>
                        </div>
                    </>
                )}
                <QuotaBar
                    label="Personal storage"
                    used={MOCK_PERSONAL_QUOTA.used}
                    total={MOCK_PERSONAL_QUOTA.total}
                    layerSize={MOCK_PERSONAL_QUOTA.layerSize}
                />
            </div>
        )
    }

    if (sourceTypeId === 'shared-with-me') {
        const results = MOCK_SHARED_SOURCES.filter(
            (s) =>
                !sharedSearch ||
                s.name.toLowerCase().includes(sharedSearch.toLowerCase()) ||
                s.owner.toLowerCase().includes(sharedSearch.toLowerCase())
        )
        return (
            <div className={styles.configForm}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                        Search sources shared with you
                    </label>
                    <input
                        className={styles.fieldInput}
                        placeholder="Search by name or owner…"
                        value={sharedSearch}
                        onChange={(e) => setSharedSearch(e.target.value)}
                    />
                    <span className={styles.fieldHint}>
                        {results.length} source
                        {results.length !== 1 ? 's' : ''} shared with you
                    </span>
                </div>
                <div className={styles.fieldGroup}>
                    <div className={styles.qmsList}>
                        {results.length === 0 ? (
                            <div
                                style={{
                                    padding: 'var(--spacers-dp16)',
                                    textAlign: 'center',
                                    color: 'var(--colors-grey600)',
                                    fontSize: 13,
                                }}
                            >
                                No sources match your search.
                            </div>
                        ) : (
                            results.map((s) => (
                                <div
                                    key={s.id}
                                    className={`${styles.qmsRow}${
                                        sharedSelected === s.id
                                            ? ` ${styles.qmsSelected}`
                                            : ''
                                    }`}
                                    onClick={() => setSharedSelected(s.id)}
                                >
                                    <div className={styles.qmsRowName}>
                                        {s.name}
                                    </div>
                                    <div className={styles.qmsRowMeta}>
                                        Shared by {s.owner} · {s.type} ·{' '}
                                        {s.date}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return null
}

ConfigStep.propTypes = {
    sourceTypeId: PropTypes.string.isRequired,
}

const MetaStep = ({ isAdmin }) => {
    const [name, setName] = useState('')
    const [thumbnailUrl, setThumbnailUrl] = useState('')
    const [tags, setTags] = useState(['health', 'global'])
    const [favoriteScope, setFavoriteScope] = useState('none')

    const removeTag = (tag) => setTags(tags.filter((t) => t !== tag))

    return (
        <div className={styles.configForm}>
            <div className={styles.metaRow}>
                <div className={styles.metaFields}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Name</label>
                        <input
                            className={styles.fieldInput}
                            placeholder="e.g. District Health Zones"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                            Thumbnail URL
                        </label>
                        <input
                            className={styles.fieldInput}
                            placeholder="https://… or upload below"
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                        />
                        <label
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 12,
                                cursor: 'pointer',
                                color: 'var(--colors-blue600)',
                                marginTop: 4,
                            }}
                        >
                            📁 Upload image
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Tags</label>
                        <div className={styles.tagRow}>
                            {tags.map((tag) => (
                                <span key={tag} className={styles.tagChip}>
                                    {tag}
                                    <button
                                        className={styles.tagChipRemove}
                                        onClick={() => removeTag(tag)}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <select
                                style={{
                                    border: 'none',
                                    fontSize: 12,
                                    color: 'var(--colors-grey600)',
                                    cursor: 'pointer',
                                }}
                                onChange={(e) => {
                                    if (
                                        e.target.value &&
                                        !tags.includes(e.target.value)
                                    ) {
                                        setTags([...tags, e.target.value])
                                    }
                                    e.target.value = ''
                                }}
                            >
                                <option value="">+ Add tag</option>
                                {MOCK_TAGS.filter((t) => !tags.includes(t)).map(
                                    (t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                            Default style
                        </label>
                        <span className={styles.disabledButton}>
                            Configure style… (not implemented in mockup)
                        </span>
                    </div>
                    {isAdmin && (
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                                Favorite for
                            </label>
                            <div className={styles.radioGroup}>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="favoriteScope"
                                        value="none"
                                        checked={favoriteScope === 'none'}
                                        onChange={() =>
                                            setFavoriteScope('none')
                                        }
                                    />
                                    None
                                </label>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="favoriteScope"
                                        value="me"
                                        checked={favoriteScope === 'me'}
                                        onChange={() => setFavoriteScope('me')}
                                    />
                                    Only me
                                </label>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="favoriteScope"
                                        value="all"
                                        checked={favoriteScope === 'all'}
                                        onChange={() => setFavoriteScope('all')}
                                    />
                                    All users
                                </label>
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.thumbnailPreview}>
                    <div className={styles.thumbnailBox}>
                        {thumbnailUrl ? (
                            <img
                                src={thumbnailUrl}
                                alt="preview"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                }}
                            />
                        ) : (
                            'Thumbnail preview'
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

MetaStep.propTypes = {
    isAdmin: PropTypes.bool.isRequired,
}

const AddSourceWizard = ({ onBack, onCancel, isAdmin, isEdit, editSource }) => {
    const displaySteps = isEdit ? STEPS.slice(1) : STEPS
    const [step, setStep] = useState(0)
    // In edit mode skip type selection — derive type from source origin
    const [selectedType, setSelectedType] = useState(
        isEdit ? ORIGIN_TO_TYPE_ID[editSource?.origin] ?? 'wms' : null
    )
    const [useAs, setUseAs] = useState('layer')

    const contentStep = isEdit ? step + 1 : step
    const canNext = contentStep === 0 ? selectedType !== null : true
    const isLastStep = step === displaySteps.length - 1

    const handleNext = () => {
        if (isLastStep) {
            onBack()
        } else {
            setStep(step + 1)
        }
    }

    const handleUseAsChange = (val) => {
        setUseAs(val)
        if (val === 'basemap' && selectedType) {
            const type = SOURCE_TYPES.find((t) => t.id === selectedType)
            if (type?.layerOnly) {
                setSelectedType(null)
            }
        }
    }

    return (
        <div className={styles.wizard}>
            <div className={styles.stepIndicator}>
                {displaySteps.map((label, i) => (
                    <React.Fragment key={label}>
                        <div
                            className={`${styles.stepDot}${
                                i < step ? ` ${styles.done}` : ''
                            }${i === step ? ` ${styles.active}` : ''}`}
                        >
                            {i < step ? '✓' : i + 1}
                        </div>
                        <span
                            className={`${styles.stepLabel}${
                                i === step ? ` ${styles.active}` : ''
                            }`}
                        >
                            {label}
                        </span>
                        {i < displaySteps.length - 1 && (
                            <div className={styles.stepConnector} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {contentStep === 0 && (
                <div className={styles.useAsToggle}>
                    <span className={styles.useAsLabel}>Use as:</span>
                    {[
                        { value: 'layer', label: 'Layer' },
                        { value: 'basemap', label: 'Basemap' },
                    ].map(({ value, label }) => (
                        <label key={value} className={styles.useAsOption}>
                            <input
                                type="radio"
                                name="useAs"
                                value={value}
                                checked={useAs === value}
                                onChange={() => handleUseAsChange(value)}
                            />
                            {label}
                        </label>
                    ))}
                </div>
            )}

            <div className={styles.stepContent}>
                {contentStep === 0 && (
                    <>
                        <div className={styles.typeGroups}>
                            {GROUPS.map((group) => (
                                <div
                                    key={group.label}
                                    className={styles.typeGroup}
                                >
                                    <p className={styles.typeGroupLabel}>
                                        {group.label}
                                    </p>
                                    <div className={styles.typeGroupTiles}>
                                        {group.ids.map((id) => {
                                            const type = SOURCE_TYPE_BY_ID[id]
                                            if (!type) {
                                                return null
                                            }
                                            const disabled =
                                                (type.layerOnly &&
                                                    useAs === 'basemap') ||
                                                (type.adminOnly && !isAdmin)
                                            return (
                                                <div
                                                    key={type.id}
                                                    className={`${
                                                        styles.typeTile
                                                    }${
                                                        selectedType === type.id
                                                            ? ` ${styles.selected}`
                                                            : ''
                                                    }${
                                                        disabled
                                                            ? ` ${styles.disabled}`
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        !disabled &&
                                                        setSelectedType(type.id)
                                                    }
                                                >
                                                    {type.adminOnly && (
                                                        <span
                                                            className={
                                                                styles.adminBadge
                                                            }
                                                        >
                                                            Admin
                                                        </span>
                                                    )}
                                                    <span
                                                        className={
                                                            styles.typeTileIcon
                                                        }
                                                    >
                                                        {type.icon}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.typeTileLabel
                                                        }
                                                    >
                                                        {type.label}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.typeTileSubLabel
                                                        }
                                                    >
                                                        {type.subLabel}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {contentStep === 1 && selectedType && (
                    <ConfigStep sourceTypeId={selectedType} />
                )}

                {contentStep === 2 && <MetaStep isAdmin={isAdmin} />}
            </div>

            <div className={styles.wizardNav}>
                <Button secondary onClick={onCancel}>
                    Cancel
                </Button>
                <ButtonStrip end>
                    {step > 0 && (
                        <Button secondary onClick={() => setStep(step - 1)}>
                            ← Back
                        </Button>
                    )}
                    <Button primary onClick={handleNext} disabled={!canNext}>
                        {isLastStep
                            ? isEdit
                                ? 'Save changes'
                                : 'Save source'
                            : 'Next →'}
                    </Button>
                </ButtonStrip>
            </div>
        </div>
    )
}

AddSourceWizard.propTypes = {
    isAdmin: PropTypes.bool.isRequired,
    onBack: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    editSource: PropTypes.object,
    isEdit: PropTypes.bool,
}

export default AddSourceWizard
