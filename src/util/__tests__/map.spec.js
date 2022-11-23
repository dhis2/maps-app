import { isValidCoordinate } from '../map'

describe('map utils: isValidCoordinate', () => {
    it('should return false if no argument is given', () => {
        expect(isValidCoordinate()).toBeFalsy()
    })

    it('should return false if argument is not an array', () => {
        expect(isValidCoordinate({})).toBeFalsy()
        expect(isValidCoordinate('7.507318')).toBeFalsy()
        expect(isValidCoordinate(7.507318)).toBeFalsy()
    })

    it('should return false if argument is array is empty, have 1 or more than two elements', () => {
        expect(isValidCoordinate([])).toBeFalsy()
        expect(isValidCoordinate([7.507318])).toBeFalsy()
        expect(isValidCoordinate([7.507318, 60.598564, 1200])).toBeFalsy()
    })

    it('should return true if argument is array with two valid elements', () => {
        expect(isValidCoordinate([7.507318, 60.598564])).toBeTruthy()
    })

    it('should return false if longitude (first argument) is out of range', () => {
        expect(isValidCoordinate([-181, 60.598564])).toBeFalsy()
        expect(isValidCoordinate([181, 60.598564])).toBeFalsy()
    })

    it('should return false if latitude (second argument) is out of range', () => {
        expect(isValidCoordinate([7.507318, 91])).toBeFalsy()
        expect(isValidCoordinate([7.507318, -90.5])).toBeFalsy()
    })
})
