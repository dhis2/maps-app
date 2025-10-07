import { hcl } from 'd3-color'
import { isString } from 'lodash/fp'
import colorbrewer from '../constants/colorbrewer.js'

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
    'Vegetation',
]

// Returns a color brewer scale for a number of classes
export const getColorPalette = (scale, classes) => colorbrewer[scale][classes]

// Returns color scale name for a palette
// join(',') is used to compare two arrays of colors
export const getColorScale = (palette) =>
    colorScales.find(
        (name) =>
            colorbrewer[name][palette.length].join(',') === palette.join(',')
    )

export const defaultColorScaleName = 'YlOrBr'
export const defaultClasses = 5
export const defaultColorScale = getColorPalette(
    defaultColorScaleName,
    defaultClasses
)

// Correct colors not adhering to the css standard (add missing #)
export const cssColor = (color) => {
    if (!isString(color)) {
        return color
    } else if (color === '##normal') {
        // ##normal is used in old map favorites
        return null // Will apply default color
    }
    return (/(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(color) ? '#' : '') + color
}

// Returns an unique color (first from an array, then random but still unique)
export const getUniqueColor = (defaultColors) => {
    const colors = [...defaultColors]

    function randomColor() {
        const color = '#000000'.replace(/0/g, () =>
            (~~(Math.random() * 16)).toString(16)
        )

        // Recursive until color is unique
        if (colors.includes(color)) {
            return randomColor()
        }

        colors.push(color)

        return color
    }

    return (index) => colors[index] || randomColor()
}

// Returns true if a color is dark
export const isDarkColor = (color) => hcl(color).l < 70

// Returns constrasting color
export const getContrastColor = (color) =>
    isDarkColor(color) ? '#fff' : '#000'
