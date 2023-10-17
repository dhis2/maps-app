import i18n from '@dhis2/d2-i18n';

const FILL = 'color';
const STROKE_COLOR = 'strokeColor';
const STROKE_WIDTH = 'weight';

// Wrapped un a function to make sure i18n is applied
const getFill = () => ({
    id: FILL,
    label: i18n.t('Fill color'),
    type: 'color',
});

const getStroke = () => ({
    id: STROKE_COLOR,
    label: i18n.t('Stroke color'),
    type: 'color',
});

const getStrokeWidth = () => ({
    id: STROKE_WIDTH,
    label: i18n.t('Stroke width'),
    type: 'number',
});

export const getFeatureStyleFields = type => {
    if (type === 'esriGeometryPolygon') {
        return [getFill(), getStroke(), getStrokeWidth()];
    }
    return [];
};

const esri2cssRgb = ([r, g, b]) => `rgb(${r},${g},${b})`;

// Inspired by simplestyle-spec
export const setDrawingInfo = (featureStyle, drawingInfo) => {
    const style = { ...featureStyle };
    const { renderer } = drawingInfo;
    const { type, symbol } = renderer;

    if (type === 'simple') {
        const { color, outline } = symbol;

        if (color && !style.fill) {
            style[FILL] = esri2cssRgb(color);
        }

        if (outline) {
            const { color, width } = outline;

            if (color && !style.stroke) {
                style[STROKE_COLOR] = esri2cssRgb(color);
            }

            if (width && !style.strokeWidth) {
                style[STROKE_WIDTH] = width;
            }
        }
    }

    return style;
};
