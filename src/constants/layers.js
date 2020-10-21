import i18n from '@dhis2/d2-i18n';
import { formatDate } from '../util/time';

export const DEFAULT_START_DATE = formatDate(
    new Date().setFullYear(new Date().getFullYear() - 1)
);
export const DEFAULT_END_DATE = formatDate(new Date());

export const DEFAULT_ORG_UNIT_LEVEL = 2;

/* RENDERING STRATEGY */
export const RENDERING_STRATEGY_SINGLE = 'SINGLE';
export const RENDERING_STRATEGY_TIMELINE = 'TIMELINE';
export const RENDERING_STRATEGY_SPLIT_BY_PERIOD = 'SPLIT_BY_PERIOD';

/* THEMATIC LAYER */
export const THEMATIC_CHOROPLETH = 'CHOROPLETH';
export const THEMATIC_BUBBLE = 'BUBBLE';
export const THEMATIC_RADIUS_LOW = 5;
export const THEMATIC_RADIUS_HIGH = 30;
export const THEMATIC_RADIUS_MIN = 0;
export const THEMATIC_RADIUS_MAX = 50;
export const THEMATIC_COLOR = '#558CC0';

export const getThematicMapTypes = () => [
    {
        id: THEMATIC_CHOROPLETH,
        name: i18n.t('Choropleth'),
    },
    {
        id: THEMATIC_BUBBLE,
        name: i18n.t('Bubble map'),
    },
];

/* EVENT LAYER */
export const EVENT_COLOR = '#333333';
export const EVENT_RADIUS = 6;
export const EVENT_BUFFER = 100;

/* TEI LAYER */
export const TEI_COLOR = '#BB0000';
export const TEI_RADIUS = 6;
export const TEI_BUFFER = 100;
export const TEI_RELATED_COLOR = '#000000';
export const TEI_RELATED_RADIUS = 3;
export const TEI_RELATIONSHIP_LINE_COLOR = '#0000BB';

/* CLASSIFICATION */
export const CLASSIFICATION_PREDEFINED = '1';
export const CLASSIFICATION_EQUAL_INTERVALS = '2';
export const CLASSIFICATION_EQUAL_COUNTS = '3';
export const CLASSIFICATION_SINGLE_COLOR = '10';

export const getLegendTypes = isBubble => [
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
];

export const getClassificationTypes = () => [
    {
        id: CLASSIFICATION_EQUAL_INTERVALS,
        name: i18n.t('Equal intervals'),
    },
    {
        id: CLASSIFICATION_EQUAL_COUNTS,
        name: i18n.t('Equal counts'),
    },
];

/* LABEL STYLES */
export const LABEL_FONT_SIZE = '11px';
export const LABEL_FONT_STYLE = 'normal';
export const LABEL_FONT_WEIGHT = 'normal';
export const LABEL_FONT_COLOR = '#333333';

export const NO_DATA_COLOR = '#CCCCCC';
