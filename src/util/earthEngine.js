export const getPrecision = (values = []) => {
    if (values.length) {
        const sortedValues = [...values].sort((a, b) => a - b);
        const minValue = sortedValues[0];
        const maxValue = sortedValues[sortedValues.length - 1];
        const gapValue = maxValue - minValue;
        const absValue = Math.abs(maxValue);

        if (absValue >= 10000) {
            return 0;
        }

        if (absValue >= 1000) {
            return gapValue > 10 ? 0 : 1;
        }

        if (absValue >= 100) {
            return gapValue > 1 ? 1 : 2;
        }

        if (absValue >= 10) {
            return gapValue > 0.1 ? 2 : 3;
        }

        if (absValue >= 1) {
            return gapValue > 0.01 ? 3 : 4;
        }

        return gapValue > 0.001 ? 4 : 5;
    }

    return 0;
};

export const getPropName = (valueType = '', layerName = '') => {
    const firstWord = layerName.replace(/ .*/, '');
    return `${valueType}${firstWord}`;
};
