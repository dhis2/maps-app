// Utils for thematic mapping
import geostats from 'geostats';
import { precisionRound } from 'd3-format';
import { numberPrecision } from './numbers';
import {
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
    CLASSIFICATION_NATURAL_BREAKS,
} from '../constants/layers';

// Returns legend item where a value belongs
export const getLegendItemForValue = (legendItems, value) => {
    const isLast = index => index === legendItems.length - 1;
    return legendItems.find(
        (item, index) =>
            value >= item.startValue &&
            (value < item.endValue || (isLast(index) && value == item.endValue))
    );
};

export const getLegendItems = (values, method, numClasses) => {
    const minValue = values[0];
    const maxValue = values[values.length - 1];
    let bins;

    // https://macwright.com/2013/02/18/literate-jenks.html
    // Candidate: https://github.com/mtralka/GeoBuckets
    const geoSeries = new geostats(values);

    if (method === CLASSIFICATION_EQUAL_INTERVALS) {
        bins = getEqualIntervals(minValue, maxValue, numClasses);

        console.log(
            'equal intervals',
            bins,
            geoSeries.getEqInterval(numClasses)
        );
    } else if (method === CLASSIFICATION_EQUAL_COUNTS) {
        bins = getQuantiles(values, numClasses);

        console.log('quantiles', bins, geoSeries.getQuantile(numClasses));
    } else if (method === CLASSIFICATION_NATURAL_BREAKS) {
        bins = getNaturalBreaks(values, numClasses);
    }

    console.log('bins', bins);

    return bins;
};

export const getEqualIntervals = (minValue, maxValue, numClasses) => {
    const bins = [];
    const binSize = (maxValue - minValue) / numClasses;
    const precision = precisionRound(binSize, maxValue);
    const valueFormat = numberPrecision(precision);

    for (let i = 0; i < numClasses; i++) {
        const startValue = minValue + i * binSize;
        const endValue = i < numClasses - 1 ? startValue + binSize : maxValue;

        bins.push({
            startValue: valueFormat(startValue),
            endValue: valueFormat(endValue),
        });
    }

    return bins;
};

export const getQuantiles = (values, numClasses) => {
    const minValue = values[0];
    const maxValue = values[values.length - 1];
    const bins = [];
    const binCount = values.length / numClasses;
    const precision = precisionRound(
        (maxValue - minValue) / numClasses,
        maxValue
    );
    const valueFormat = numberPrecision(precision);

    let binLastValPos = binCount === 0 ? 0 : binCount;

    if (values.length > 0) {
        bins[0] = minValue;
        for (let i = 1; i < numClasses; i++) {
            bins[i] = values[Math.round(binLastValPos)];
            binLastValPos += binCount;
        }
    }

    // bin can be undefined if few values
    return bins
        .filter(bin => bin !== undefined)
        .map((value, index) => ({
            startValue: valueFormat(value),
            endValue: valueFormat(bins[index + 1] || maxValue),
        }));
};

export const getNaturalBreaks = (values, numClasses) => {
    const geoSeries = new geostats(values);

    // https://github.com/simogeo/geostats/pull/49
    const jenks = geoSeries.getClassJenks2(numClasses);

    const bins = jenks.reduce((arr, startValue, index) => {
        const endValue = jenks[index + 1];

        if (endValue !== undefined) {
            arr.push({ startValue, endValue });
        }

        return arr;
    }, []);

    console.log(
        'CLASSIFICATION_NATURAL_BREAKS',
        numClasses,
        values,
        jenks,
        bins
    );
    return bins;
};
