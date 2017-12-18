// Utils for thematic mapping

import curryRight from 'lodash/fp/curryRight';


export const classify = (features, options) => {
    const { method, classes, colorScale } = options;
    const values = features.map(feature => Number(feature.properties.value)).sort((a, b) => a - b);
    const bins = getClassBins(values, method, classes);
    const getClassIndex = curryRight(getClass)(bins);

    // console.log('bins', bins, getClassIndex(20));

    if (bins.length) {
       features.forEach(feature => {
           feature.properties.color = colorScale[getClassIndex(feature.properties.value) - 1];
           // console.log(feature.properties.value, getClassIndex(feature.properties.value), feature.properties.color);
       });
    }

    console.log(bins);
};



// export function getClass()

// Returns class number
export const getClass = (value, bins) => {
    if (value >= bins[0]) {
        for (let i = 1; i < bins.length; i++) {
            if (value < bins[i]) {
                return i;
            }
        }

        // If value is the highest number, use the last bin index
        if (value === bins[bins.length - 1]) {
            return bins.length - 1;
        }
    }

    return null;
};

export const getClassBins = (values, method, numClasses) => {
    const minValue = values[0];
    const maxValue = values[values.length - 1];
    let bins;

    if (method === 2) { // Equal intervals - TODO: Use constant
        bins = getEqualIntervals(minValue, maxValue, numClasses);
    } else if (method === 3) { // Quantiles - TODO: Use constant
        bins = getQuantiles(values, numClasses);
    }

    return bins;
};

export const getEqualIntervals = (minValue, maxValue, numClasses) => {
    const bins = [];
    const binSize = (maxValue - minValue) / numClasses;

    for (let i = 0; i < numClasses; i++) {
        bins.push(minValue + (i * binSize));
    }

    bins.push(maxValue);

    return bins;
};

// Values had to be ordered!
export const getQuantiles = (values, numClasses) => {
    const minValue = values[0];
    const maxValue = values[values.length - 1];
    const bins = [];
    const binCount = Math.round(values.length / numClasses);
    let binLastValPos = (binCount === 0) ? 0 : binCount;

    if (values.length > 0) {
        bins[0] = minValue;
        for (let i = 1; i < numClasses; i++) {
            bins[i] = values[binLastValPos];
            binLastValPos += binCount;
        }
        bins.push(maxValue);
    }

    return bins;
};

// Classify data
export function classify_old(features, values, options, legend) {
    const method = options.method;
    let bounds = [];
    let colors = [];

    if (method === 1) { // predefined bounds
        bounds = options.bounds;
        colors = options.colors;

    } else if (method === 2) { // equal intervals
        for (let i = 0; i <= options.numClasses; i++) {
            bounds[i] = options.minValue + i * (options.maxValue - options.minValue) / options.numClasses;
        }

        // Make sure that last bounds is exactly max value.
        bounds[bounds.length - 1] = options.maxValue;

        options.bounds = bounds;

        if (!options.colors.length) { // Backward compability
            options.colors = getColorsByRgbInterpolation(options.colorLow, options.colorHigh, options.numClasses);
        }

    } else if (method === 3) { // quantiles
        const binSize = Math.round(values.length / options.numClasses);
        let binLastValPos = (binSize === 0) ? 0 : binSize;

        if (values.length > 0) {
            bounds[0] = values[0];
            for (let i = 1; i < options.numClasses; i++) {
                bounds[i] = values[binLastValPos];
                binLastValPos += binSize;

                if (binLastValPos > values.length - 1) {
                    binLastValPos = values.length - 1;
                }
            }
            bounds.push(values[values.length - 1]);
        }

        for (let j = 0; j < bounds.length; j++) {
            bounds[j] = parseFloat(bounds[j]);
        }

        options.bounds = bounds;

        if (!options.colors.length) { // Backward compability
            options.colors = getColorsByRgbInterpolation(options.colorLow, options.colorHigh, options.numClasses);
        }
    }

    if (bounds.length) {
        for (let i = 0, prop, value, classNumber, legendItem; i < features.length; i++) {
            prop = features[i].properties;
            value = prop[options.indicator];
            classNumber = getClass(value, bounds);
            legendItem = legend.items[classNumber - 1];

            prop.color = options.colors[classNumber - 1];
            prop.radius = (value - options.minValue) / (options.maxValue - options.minValue) * (options.maxSize - options.minSize) + options.minSize;
            prop.legend = legendItem.name;
            prop.range = legendItem.range.replace(/ *\([^)]*\) */g, ''); // Remove count in brackets

            // Count features in each class
            if (!options.count[classNumber]) {
                options.count[classNumber] = 1;
            } else {
                options.count[classNumber]++;
            }
        }
    }
}



export function getColorsByRgbInterpolation(firstColor, lastColor, nbColors) {
    const colors = [];
    const colorA = hexToRgb('#' + firstColor);
    const colorB = hexToRgb('#' + lastColor);

    if (nbColors == 1) {
        return ['#' + firstColor];
    }
    for (let i = 0; i < nbColors; i++) {
        colors.push(rgbToHex({
            r: parseInt(colorA.r + i * (colorB.r - colorA.r) / (nbColors - 1)),
            g: parseInt(colorA.g + i * (colorB.g - colorA.g) / (nbColors - 1)),
            b: parseInt(colorA.b + i * (colorB.b - colorA.b) / (nbColors - 1)),
        }));
    }
    return colors;
}

// Convert hex color to RGB
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
}

// Convert RGB color to hex
export function rgbToHex (rgb) {
    return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}