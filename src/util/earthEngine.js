export const getPropName = (valueType = '', layerName = '') => {
    const firstWord = layerName.replace(/ .*/, '');
    return `${valueType}${firstWord}`;
};
