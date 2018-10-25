// Resolutions used by PNG download
// Inspired by kepler.gl: https://github.com/uber/kepler.gl/blob/master/src/constants/default-settings.js

export const RATIO_OPTIONS = [
    {
        id: 'screen',
        label: 'Original Screen',
        getSize: (screenW, screenH) => ({ width: screenW, height: screenH }),
    },
    {
        id: 'four_by_three',
        label: '4:3',
        getSize: screenW => ({
            width: screenW,
            height: Math.round(screenW * 0.75),
        }),
    },
    {
        id: 'sixteen_by_nine',
        label: '16:9',
        getSize: screenW => ({
            width: screenW,
            height: Math.round(screenW * 0.5625),
        }),
    },
];

export const RESOLUTION_OPTIONS = [
    {
        id: '1x',
        label: '1x',
        available: true,
        scale: 1,
        zoomOffset: Math.log2(1),
        getSize: (screenW, screenH) => ({
            width: screenW,
            height: screenH,
        }),
    },
    {
        id: '2x',
        label: '2x',
        available: true,
        scale: 2,
        zoomOffset: Math.log2(2),
        getSize: (screenW, screenH) => ({
            width: screenW * 2,
            height: screenH * 2,
        }),
    },
];
