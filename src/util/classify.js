// Utils for thematic mapping
import { format, precisionRound } from 'd3-format';
import {
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
} from '../constants/layers';

// Returns legend item where a value belongs
export const getLegendItemForValue = (legendItems, value) => {
    const isLast = index => index === legendItems.length - 1;
    return legendItems.find(
        (item, index) =>
            value >= item.startValue &&
            (value < item.endValue ||
                (isLast(index) && value === item.endValue))
    );
};

export const getLegendItems = (values, method, numClasses) => {
    const minValue = values[0];
    const maxValue = values[values.length - 1];
    let bins;

    if (method === CLASSIFICATION_EQUAL_INTERVALS) {
        bins = getEqualIntervals(minValue, maxValue, numClasses);
    } else if (method === CLASSIFICATION_EQUAL_COUNTS) {
        bins = getQuantiles(values, numClasses);
    }

    return bins;
};

export const getClassBins = (values, method, numClasses) => {
    const minValue = values[0];
    const maxValue = values[values.length - 1];
    let bins;

    if (method === CLASSIFICATION_EQUAL_INTERVALS) {
        bins = getEqualIntervals(minValue, maxValue, numClasses);
    } else if (method === CLASSIFICATION_EQUAL_COUNTS) {
        bins = getQuantiles(values, numClasses);
    }

    return bins;
};

export const getEqualIntervals = (minValue, maxValue, numClasses) => {
    const bins = [];
    const binSize = (maxValue - minValue) / numClasses;
    const precision = precisionRound(binSize, maxValue);

    const valueFormat = format(`.${precision}f`);

    for (let i = 0; i < numClasses; i++) {
        const startValue = minValue + i * binSize;
        const endValue = i < numClasses - 1 ? startValue + binSize : maxValue;

        bins.push({
            startValue: Number(valueFormat(startValue)),
            endValue: Number(valueFormat(endValue)),
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
    const valueFormat = format(`.${precision}f`);

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
            startValue: Number(valueFormat(value)),
            endValue: Number(valueFormat(bins[index + 1] || maxValue)),
        }));
};
