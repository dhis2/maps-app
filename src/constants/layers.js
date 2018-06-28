import { timeFormat } from 'd3-time-format';

const formatTime = timeFormat('%Y-%m-%d');

/* EVENT LAYER */
export const EVENT_START_DATE = formatTime(
    new Date().setFullYear(new Date().getFullYear() - 1)
);
export const EVENT_END_DATE = formatTime(new Date());
export const EVENT_COLOR = '#333333';
export const EVENT_RADIUS = 6;
export const EVENT_BUFFER = 100;

/* TEI LAYER */
export const TEI_START_DATE = formatTime(
    new Date().setFullYear(new Date().getFullYear() - 1)
);
export const TEI_END_DATE = formatTime(new Date());
export const TEI_COLOR = '#BB0000';
export const TEI_RADIUS = 6;
export const TEI_BUFFER = 100;

/* BUFFERS */
export const BUFFER_MAX_FILL_OPACITY = 0.4;
export const BUFFER_MAX_LINE_OPACITY = 0.6;

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
