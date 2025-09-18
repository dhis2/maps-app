import i18n from '@dhis2/d2-i18n'

export const VECTOR_STYLE = 'vectorStyle'
export const TILE_LAYER = 'tileLayer'
export const WMS_LAYER = 'wmsLayer'
export const GOOGLE_LAYER = 'googleLayer'
export const BING_LAYER = 'bingLayer'
export const EVENT_LAYER = 'event'
export const THEMATIC_LAYER = 'thematic'
export const FACILITY_LAYER = 'facility'
export const BOUNDARY_LAYER = 'boundary'
export const ORG_UNIT_LAYER = 'orgUnit'
export const EXTERNAL_LAYER = 'external'
export const EARTH_ENGINE_LAYER = 'earthEngine'
export const TRACKED_ENTITY_LAYER = 'trackedEntity'
export const GEOJSON_LAYER = 'geoJson'
export const GROUP_LAYER = 'group'
export const GEOJSON_URL_LAYER = 'geoJsonUrl'

export const DOWNLOADABLE_LAYER_TYPES = [
    FACILITY_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    EVENT_LAYER,
    EARTH_ENGINE_LAYER,
    GEOJSON_URL_LAYER,
]

export const DATA_TABLE_LAYER_TYPES = [
    FACILITY_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    EVENT_LAYER,
    EARTH_ENGINE_LAYER,
    GEOJSON_URL_LAYER,
]

export const MAP_LAYER_POSITION_BASEMAP = 'BASEMAP'
export const MAP_LAYER_POSITION_OVERLAY = 'OVERLAY'

export const OPEN_AS_LAYER_TYPES = [THEMATIC_LAYER]

export const DEFAULT_ORG_UNIT_LEVEL = 1 // 0 is root level

/* FITBOUNDS */
export const PADDING_DEFAULT = { top: 40, right: 40, bottom: 40, left: 40 }
export const PADDING_TIMELINE = { bottom: 90 }
export const DURATION_DEFAULT = 0
export const DURATION_TIMELINE = 500

/* RENDERING STRATEGY */
export const RENDERING_STRATEGY_SINGLE = 'SINGLE'
export const RENDERING_STRATEGY_TIMELINE = 'TIMELINE'
export const RENDERING_STRATEGY_SPLIT_BY_PERIOD = 'SPLIT_BY_PERIOD'

/* THEMATIC LAYER */
export const THEMATIC_CHOROPLETH = 'CHOROPLETH'
export const THEMATIC_BUBBLE = 'BUBBLE'
export const THEMATIC_RADIUS_LOW = 5
export const THEMATIC_RADIUS_HIGH = 30
export const THEMATIC_RADIUS_MIN = 0
export const THEMATIC_RADIUS_MAX = 50
export const THEMATIC_COLOR = '#558CC0'
export const THEMATIC_BUFFER = 5000

export const getThematicMapTypes = () => [
    {
        id: THEMATIC_CHOROPLETH,
        name: i18n.t('Choropleth'),
        image: 'images/choropleth.png',
    },
    {
        id: THEMATIC_BUBBLE,
        name: i18n.t('Bubble map'),
        image: 'images/bubble.png',
    },
]

/* EVENT LAYER */
export const EVENT_CLIENT_PAGE_SIZE = 100000
export const EVENT_SERVER_CLUSTER_COUNT = 2000
export const EVENT_COLOR = '#333333'
export const EVENT_RADIUS = 6
export const EVENT_BUFFER = 100
export const EVENT_COORDINATE_DEFAULT = 'psigeometry'
export const EVENT_COORDINATE_ENROLLMENT = 'pigeometry'
export const EVENT_COORDINATE_TRACKED_ENTITY = 'teigeometry'
export const EVENT_COORDINATE_ORG_UNIT = 'ougeometry'
export const EVENT_COORDINATE_CASCADING = 'cascading'
export const COORDINATE_FIELD_NAMES = {
    [EVENT_COORDINATE_DEFAULT]: i18n.t('Event location'),
    [EVENT_COORDINATE_ENROLLMENT]: i18n.t('Enrollment location'),
    [EVENT_COORDINATE_TRACKED_ENTITY]: i18n.t('Tracked entity location'),
}

/* TEI LAYER */
export const TEI_COLOR = '#BB0000'
export const TEI_RADIUS = 6
export const TEI_BUFFER = 100
export const TEI_RELATED_COLOR = '#000000'
export const TEI_RELATED_RADIUS = 3
export const TEI_RELATIONSHIP_LINE_COLOR = '#0000BB'

/* FACILITY LAYER */
export const FACILITY_BUFFER = 5000

/* ORG UNIT LAYER */
export const ORG_UNIT_COLOR = '#333333'
export const ORG_UNIT_RADIUS = 6
export const ORG_UNIT_RADIUS_SMALL = 1

/* EARTH ENGINE LAYER */
export const EE_BUFFER = 5000

/* CLASSIFICATION */
export const CLASSIFICATION_PREDEFINED = 1
export const CLASSIFICATION_EQUAL_INTERVALS = 2
export const CLASSIFICATION_EQUAL_COUNTS = 3
export const CLASSIFICATION_SINGLE_COLOR = 10

export const getLegendTypes = (isBubble) => [
    {
        id: CLASSIFICATION_EQUAL_INTERVALS,
        name: i18n.t('Automatic color legend'),
    },
    {
        id: CLASSIFICATION_PREDEFINED,
        name: i18n.t('Predefined color legend'),
    },
    ...(isBubble
        ? [
              {
                  id: CLASSIFICATION_SINGLE_COLOR,
                  name: i18n.t('Single color legend'),
              },
          ]
        : []),
]

export const getClassificationTypes = () => [
    {
        id: CLASSIFICATION_EQUAL_INTERVALS,
        name: i18n.t('Equal intervals'),
    },
    {
        id: CLASSIFICATION_EQUAL_COUNTS,
        name: i18n.t('Equal counts'),
    },
]

export const STYLE_TYPE_COLOR = 'COLOR'
export const STYLE_TYPE_SYMBOL = 'SYMBOL'

export const getGroupSetStyleTypes = () => [
    {
        id: STYLE_TYPE_COLOR,
        name: i18n.t('Color'),
    },
    {
        id: STYLE_TYPE_SYMBOL,
        name: i18n.t('Symbol'),
    },
]

/* LABEL TEMPLATES */
export const LABEL_TEMPLATE_NAME_ONLY = '{name}'
export const LABEL_TEMPLATE_NAME_AND_VALUE = '{name}\n{value}'
export const LABEL_TEMPLATE_VALUE_ONLY = '{value}'

/* LABEL STYLES */
export const LABEL_FONT_SIZE = '14px'
export const LABEL_FONT_SIZE_MIN = 6
export const LABEL_FONT_SIZE_MAX = 100
export const LABEL_FONT_STYLE = 'normal'
export const LABEL_FONT_WEIGHT = 'normal'
export const LABEL_FONT_COLOR = '#333333'

export const NO_DATA_COLOR = '#CCCCCC'

/* POINT RADIUS */
export const MIN_RADIUS = 1
export const MAX_RADIUS = 100

export const NONE = 'none'
