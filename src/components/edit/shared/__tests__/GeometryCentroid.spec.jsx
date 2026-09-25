import { needsGeometryCentroid } from '../GeometryCentroid.jsx'

describe('needsGeometryCentroid', () => {
    it('is false when both fields are built-in point-only fields', () => {
        expect(needsGeometryCentroid('psigeometry', 'pigeometry')).toBe(false)
    })

    it('is false when the main field is a COORDINATE-valueType custom field', () => {
        expect(needsGeometryCentroid('COORDINATE', undefined)).toBe(false)
    })

    it('is true when the main field is an org unit field', () => {
        expect(needsGeometryCentroid('ougeometry', undefined)).toBe(true)
    })

    it('is true when only the fallback field needs it, main field is default', () => {
        expect(needsGeometryCentroid('psigeometry', 'ougeometry')).toBe(true)
    })

    it('is true when the fallback is Cascading, since it always includes org unit', () => {
        expect(needsGeometryCentroid('psigeometry', 'cascading')).toBe(true)
    })

    it('is false when the fallback is cleared (undefined type)', () => {
        expect(needsGeometryCentroid('psigeometry', undefined)).toBe(false)
    })

    it('is true when either field is an unrecognized custom valueType', () => {
        expect(needsGeometryCentroid('TEXT', undefined)).toBe(true)
        expect(needsGeometryCentroid('psigeometry', 'TEXT')).toBe(true)
    })
})
