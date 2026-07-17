import * as types from '../../constants/actionTypes.js'
import {
    highlightFeature,
    setFeatureProfile,
    closeFeatureProfile,
} from '../feature.js'

describe('highlightFeature', () => {
    it('creates a FEATURE_HIGHLIGHT action', () => {
        const payload = { id: 'feat1' }

        expect(highlightFeature(payload)).toEqual({
            type: types.FEATURE_HIGHLIGHT,
            payload,
        })
    })
})

describe('setFeatureProfile', () => {
    it('creates a FEATURE_PROFILE_SET action', () => {
        const payload = { id: 'feat1' }

        expect(setFeatureProfile(payload)).toEqual({
            type: types.FEATURE_PROFILE_SET,
            payload,
        })
    })
})

describe('closeFeatureProfile', () => {
    it('creates a FEATURE_PROFILE_CLOSE action', () => {
        expect(closeFeatureProfile()).toEqual({
            type: types.FEATURE_PROFILE_CLOSE,
        })
    })
})
