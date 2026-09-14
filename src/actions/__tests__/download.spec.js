import * as types from '../../constants/actionTypes.js'
import { setDownloadConfig } from '../download.js'

describe('setDownloadConfig', () => {
    it('creates a DOWNLOAD_CONFIG_SET action', () => {
        const payload = { format: 'png' }

        expect(setDownloadConfig(payload)).toEqual({
            type: types.DOWNLOAD_CONFIG_SET,
            payload,
        })
    })
})
