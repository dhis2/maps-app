import { isString } from 'lodash/fp';
import colorbrewer from '../constants/colorbrewer';

// Allowed color scales from ColorBrewer for EE (needs to have at least 9 classes)
export const colorScales = [
    'YlOrBr',
    'Reds',
    'YlGn',
    'Greens',
    'Blues',
    'BuPu',
    'RdPu',
    'PuRd',
    'Greys',
    'YlOrBr_reverse',
    'Reds_reverse',
    'YlGn_reverse',
    'Greens_reverse',
    'Blues_reverse',
    'BuPu_reverse',
    'RdPu_reverse',
    'PuRd_reverse',
    'Greys_reverse',
    'PuOr',
    'BrBG',
    'PRGn',
    'PiYG',
    'RdBu',
    'RdGy',
    'RdYlBu',
    'Spectral',
    'RdYlGn',
    'Paired',
    'Pastel1',
    'Set1',
    'Set3',
];

// Returns a color brewer scale for a number of classes
export const getColorPalette = (scale, classes) => {
    return colorbrewer[scale][classes].join(',');
};

// Returns color scale name for a palette
export const getColorScale = palette => {
    const classes = palette.split(',').length;
    return colorScales.find(
        name => colorbrewer[name][classes].join(',') === palette
    );
};

export const defaultColorScaleName = 'YlOrBr';
export const defaultClasses = 5;
export const defaultColorScale = getColorPalette(
    defaultColorScaleName,
    defaultClasses
);

// Correct colors not adhering to the css standard (add missing #)
export const cssColor = color => {
    if (!isString(color)) {
        return color;
    } else if (color === '##normal') {
        // ##normal is used in old map favorites
        return null; // Will apply default color
    }
    return (/(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(color) ? '#' : '') + color;
};
