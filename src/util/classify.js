// Utils for thematic mapping

import curryRight from 'lodash/fp/curryRight';

export const classify = (features, options) => {
    const { method, classes, colorScale } = options;
    const values = features.map(feature => Number(feature.properties.value)).sort((a, b) => a - b);
    const bins = getClassBins(values, method, classes);
    const getClassIndex = curryRight(getClass)(bins);

    if (bins.length) {
       features.forEach(feature => {
           feature.properties.color = colorScale[getClassIndex(feature.properties.value) - 1];
           // console.log(feature.properties.value, getClassIndex(feature.properties.value), feature.properties.color);
       });
    }

    console.log(bins);
};



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

export const getLegendItems = (values, method, numClasses) => {
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
        const startValue = minValue + (i * binSize);

        bins.push({
            startValue: startValue,
            endValue: (i < numClasses - 1) ? startValue + binSize : maxValue,
        });
    }

    return bins;
};

// TODO: Refactor
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
        // bins.push(maxValue);
    }

    return bins.map((value, index) => ({
        startValue: value,
        endValue: bins[index + 1] || maxValue
    }));
};
