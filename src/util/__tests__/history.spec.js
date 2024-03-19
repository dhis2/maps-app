import queryString from 'query-string'
import { getHashUrlParams } from '../history.js'

jest.mock('query-string', () => ({
    parse: jest.fn(() => {}),
}))

describe('getHashUrlParams', () => {
    it('should return isDownload=true when pathname is /download', () => {
        queryString.parse.mockImplementationOnce(() => ({}))
        const loc = { search: '', pathname: '/download' }
        expect(getHashUrlParams(loc)).toEqual({ isDownload: true, mapId: '' })
    })

    it('should return mapId="currentAnalyticalObject" when pathname is /currentAnalyticalObject', () => {
        queryString.parse.mockImplementationOnce(() => ({}))
        const loc = { search: '', pathname: '/currentAnalyticalObject' }
        expect(getHashUrlParams(loc)).toEqual({
            mapId: 'currentAnalyticalObject',
        })
    })

    it('should return param and mapId when search is ?param=true and pathname is /xyzpdq', () => {
        queryString.parse.mockImplementationOnce(() => ({ param: true }))
        const loc = { search: '?param=true', pathname: '/xyzpdq' }
        expect(getHashUrlParams(loc)).toEqual({ param: true, mapId: 'xyzpdq' })
    })

    it('should return param, mapId, and isDownload when search is ?param=false and pathname is /xyzpdq/download', () => {
        queryString.parse.mockImplementationOnce(() => ({ param: false }))
        const loc = { search: '?param=false', pathname: '/xyzpdq/download' }
        expect(getHashUrlParams(loc)).toEqual({
            param: false,
            mapId: 'xyzpdq',
            isDownload: true,
        })
    })

    it('should return interpretationId and isDownload when search is ?interpretationId=xyzpdq and pathname is /download', () => {
        queryString.parse.mockImplementationOnce(() => ({
            interpretationId: 'xyzpdq',
        }))
        const loc = {
            search: '?interpretationId=xyzpdq',
            pathname: '/download',
        }
        expect(getHashUrlParams(loc)).toEqual({
            interpretationId: 'xyzpdq',
            isDownload: true,
            mapId: '',
        })
    })

    it('should return interpretationId and mapId when search is ?interpretationId=xyzpdq and pathname is /xyzpdq', () => {
        queryString.parse.mockImplementationOnce(() => ({
            interpretationId: 'xyzpdq',
        }))
        const loc = { search: '?interpretationId=xyzpdq', pathname: '/xyzpdq' }
        expect(getHashUrlParams(loc)).toEqual({
            interpretationId: 'xyzpdq',
            mapId: 'xyzpdq',
        })
    })

    it('should return interpretationId, mapId, and isDownload when search is ?interpretationId=xyzpdq and pathname is /xyzpdq/download', () => {
        queryString.parse.mockImplementationOnce(() => ({
            interpretationId: 'xyzpdq',
        }))
        const loc = {
            search: '?interpretationId=xyzpdq',
            pathname: '/xyzpdq/download',
        }
        expect(getHashUrlParams(loc)).toEqual({
            interpretationId: 'xyzpdq',
            mapId: 'xyzpdq',
            isDownload: true,
        })
    })
})
