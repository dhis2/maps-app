import { dateFormat } from '../util/time';

export const DEFAULT_START_DATE = dateFormat(
    new Date().setFullYear(new Date().getFullYear() - 1)
);
export const DEFAULT_END_DATE = dateFormat(new Date());

export const DEFAULT_ORG_UNIT_LEVEL = 2;

/* EVENT LAYER */
export const EVENT_COLOR = '#333333';
export const EVENT_RADIUS = 6;
export const EVENT_BUFFER = 100;

/* TEI LAYER */
export const TEI_COLOR = '#BB0000';
export const TEI_RADIUS = 6;
export const TEI_BUFFER = 100;

/* BUFFERS */
export const BUFFER_MAX_FILL_OPACITY = 0.3;
export const BUFFER_MAX_LINE_OPACITY = 0.7;

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
