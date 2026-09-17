import { COLOR_SET_DEFAULT, colorSets } from '@dhis2/analytics'
import { hcl } from 'd3-color'
import { isString } from 'lodash/fp'
import colorbrewer from '../constants/colorbrewer.js'

// Allowed color scales from ColorBrewer for EE (needs to have at least 9 classes)
export const colorScales = [
    // Sequential
    'YlOrBr',
    'Reds',
    'YlGn',
    'Greens',
    'Vegetation',
    'Purples',
    'Blues',
    'BuPu',
    'RdPu',
    'PuRd',
    'Greys',
    'YlOrBr_reverse',
    'Reds_reverse',
    'YlGn_reverse',
    'Greens_reverse',
    'Vegetation_reverse',
    'Purples_reverse',
    'Blues_reverse',
    'BuPu_reverse',
    'RdPu_reverse',
    'PuRd_reverse',
    'Greys_reverse',
    // Diverging
    'PuOr',
    'BrBG',
    'PRGn',
    'PiYG',
    'RdBu',
    'RdGy',
    'RdYlBu',
    'Spectral',
    'RdYlGn',
    'PuOr_reverse',
    'BrBG_reverse',
    'PRGn_reverse',
    'PiYG_reverse',
    'RdBu_reverse',
    'RdGy_reverse',
    'RdYlBu_reverse',
    'Spectral_reverse',
    'RdYlGn_reverse',
    // Qualitative
    'Paired',
    'Pastel1',
    'Set1',
    'Set3',
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

// A curated subset of the Data Visualizer default palette, rather than
// cycling through the full ~19-color set: with many clusters, that many
// hues on screen at once reads as noisy, and most of that variety is
// wasted anyway since color only needs to disambiguate *nearby* clusters
// — two clusters on opposite sides of the map reusing a color causes no
// real confusion. Picked (as a literal allowlist, not a formula) for
// maximum mutual distinctiveness — spread across hue, excluding the two
// greys (see EVENT_DBSCAN_NOISE_COLOR, grey is already reserved for
// noise) and the palette's very pale, washed-out entries. The filter
// against the actual default palette (rather than just hardcoding these
// hex values) is what guarantees every one of these really is a member
// of that palette, not a color that merely looks similar to it.
const CLUSTER_COLOR_ALLOWLIST = [
    '#518cc3', // blue
    '#d74554', // red
    '#ff9e21', // orange
    '#47792c', // green
    '#45beae', // teal
    '#ba3ba1', // magenta
    '#6b2dd4', // violet
]
const clusterColors = colorSets[COLOR_SET_DEFAULT].colors.filter((color) =>
    CLUSTER_COLOR_ALLOWLIST.includes(color)
)

// Mockup for DHIS2-21461: a distinct color per DBSCAN cluster (identity,
// not density, is what a cluster index encodes), cycling through the
// curated subset above so an arbitrary number of clusters always gets a
// color rather than being capped by palette size. excludeColors lets a
// caller avoid handing out the same color to two *nearby* clusters (see
// EventLayer's greedy assignment) — falls back to the plain cycled color
// if every option is excluded (rare: only when a cluster has more close
// neighbors than there are colors), rather than returning nothing.
export const getClusterColor = (index, excludeColors = []) => {
    for (let offset = 0; offset < clusterColors.length; offset++) {
        const color = clusterColors[(index + offset) % clusterColors.length]
        if (!excludeColors.includes(color)) {
            return color
        }
    }
    return clusterColors[index % clusterColors.length]
}

// Returns an unique color (first from an array, then random but still unique)
export const getUniqueColor = (defaultColors) => {
    const colors = [...defaultColors]

    function randomColor() {
        const color = '#000000'.replaceAll('0', () =>
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

export const getCssColor = (cssVar) =>
    getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()

// Returns true if a color is dark
export const isDarkColor = (color) => hcl(color).l < 70

// Returns constrasting color
export const getContrastColor = (color) =>
    isDarkColor(color) ? '#fff' : '#000'
