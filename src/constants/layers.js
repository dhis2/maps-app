import { formatDate } from '../util/time';

export const DEFAULT_START_DATE = formatDate(
    new Date().setFullYear(new Date().getFullYear() - 1)
);
export const DEFAULT_END_DATE = formatDate(new Date());

export const DEFAULT_ORG_UNIT_LEVEL = 2;

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
export const CLASSIFICATION_PREDEFINED = 1;
export const CLASSIFICATION_EQUAL_INTERVALS = 2;
export const CLASSIFICATION_EQUAL_COUNTS = 3;

export const classificationTypes = [
    {
        id: CLASSIFICATION_EQUAL_INTERVALS,
        name: 'Equal intervals',
    },
    {
        id: CLASSIFICATION_EQUAL_COUNTS,
        name: 'Equal counts',
    },
];

/* LABEL STYLES */
export const LABEL_FONT_SIZE = '11px';
export const LABEL_FONT_STYLE = 'normal';
export const LABEL_FONT_WEIGHT = 'normal';
export const LABEL_FONT_COLOR = '#333333';
