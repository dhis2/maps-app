import store from '../store';

const defaultKeyAnalysisDisplayProperty = 'displayName';

const displayPropertyMap = {
    name: 'displayName',
    displayName: 'displayName',
    shortName: 'displayShortName',
    displayShortName: 'displayShortName',
};

export const getDisplayPropertyUrl = () => {
    const keyAnalysisDisplayProperty = displayPropertyMap[store.getState().userSettings.keyAnalysisDisplayProperty || defaultKeyAnalysisDisplayProperty];
    return keyAnalysisDisplayProperty + '~rename(name)';
};
