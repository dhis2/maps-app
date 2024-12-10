import { getFixedPeriodsByType, getPeriodsDurationByType } from '../periods.js'

const periods = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]

const periodsDetails = {
    1: { type: 'TYPE_A', offset: -1, duration: 3 },
    2: { type: 'TYPE_B', offset: -1, duration: 2 },
    3: { type: 'TYPE_A', offset: 0, duration: 4 },
}

describe('util/periods', () => {
    test('getFixedPeriodsByType - RELATIVE', () => {
        expect(
            getFixedPeriodsByType({ periodType: 'RELATIVE', year: 2020 })
        ).toBe(null)
    })

    test('getFixedPeriodsByType - YEAR not provided', () => {
        expect(getFixedPeriodsByType({ periodType: 'MONTHLY' })).toStrictEqual(
            []
        )
    })

    test('getFixedPeriodsByType - MONTHLY first and last date', () => {
        expect(
            getFixedPeriodsByType({
                periodType: 'MONTHLY',
                year: 2020,
                firstDate: '2020-04-01',
                lastDate: '2020-08-30',
                periodsSettings: {
                    locale: 'en',
                    calendar: 'gregory',
                },
            })
        ).toStrictEqual([
            {
                displayName: 'July 2020',
                endDate: '2020-07-31',
                id: '202007',
                iso: '202007',
                name: 'July 2020',
                periodType: 'MONTHLY',
                startDate: '2020-07-01',
            },
            {
                displayName: 'June 2020',
                endDate: '2020-06-30',
                id: '202006',
                iso: '202006',
                name: 'June 2020',
                periodType: 'MONTHLY',
                startDate: '2020-06-01',
            },
            {
                displayName: 'May 2020',
                endDate: '2020-05-31',
                id: '202005',
                iso: '202005',
                name: 'May 2020',
                periodType: 'MONTHLY',
                startDate: '2020-05-01',
            },
            {
                displayName: 'April 2020',
                endDate: '2020-04-30',
                id: '202004',
                iso: '202004',
                name: 'April 2020',
                periodType: 'MONTHLY',
                startDate: '2020-04-01',
            },
        ])
    })

    test('getFixedPeriodsByType - YEARLY first and last date', () => {
        expect(
            getFixedPeriodsByType({
                periodType: 'YEARLY',
                year: 2020,
                firstDate: '2018-04-01',
                lastDate: '2021-04-01',
                periodsSettings: {
                    locale: 'en',
                    calendar: 'gregory',
                },
            })
        ).toStrictEqual([
            {
                displayName: '2020',
                endDate: '2020-12-31',
                id: '2020',
                iso: '2020',
                name: '2020',
                periodType: 'YEARLY',
                startDate: '2020-01-01',
            },
            {
                displayName: '2019',
                endDate: '2019-12-31',
                id: '2019',
                iso: '2019',
                name: '2019',
                periodType: 'YEARLY',
                startDate: '2019-01-01',
            },
        ])
    })

    test('getFixedPeriodsByType - YEARLY first date', () => {
        expect(
            getFixedPeriodsByType({
                periodType: 'YEARLY',
                year: 2020,
                firstDate: '2020-04-01',
            })
        ).toStrictEqual([])
    })

    test('getFixedPeriodsByType - FYAPR 2020', () => {
        expect(
            getFixedPeriodsByType({
                periodType: 'FYAPR',
                year: 2020,
                periodsSettings: {
                    locale: 'en',
                    calendar: 'gregory',
                },
            })
        ).toStrictEqual([
            {
                displayName: 'April 2020 - March 2021',
                endDate: '2021-03-31',
                id: '2020April',
                iso: '2020April',
                name: 'April 2020 - March 2021',
                periodType: 'FYAPR',
                startDate: '2020-04-01',
            },
            {
                displayName: 'April 2019 - March 2020',
                endDate: '2020-03-31',
                id: '2019April',
                iso: '2019April',
                name: 'April 2019 - March 2020',
                periodType: 'FYAPR',
                startDate: '2019-04-01',
            },
            {
                displayName: 'April 2018 - March 2019',
                endDate: '2019-03-31',
                id: '2018April',
                iso: '2018April',
                name: 'April 2018 - March 2019',
                periodType: 'FYAPR',
                startDate: '2018-04-01',
            },
            {
                displayName: 'April 2017 - March 2018',
                endDate: '2018-03-31',
                id: '2017April',
                iso: '2017April',
                name: 'April 2017 - March 2018',
                periodType: 'FYAPR',
                startDate: '2017-04-01',
            },
            {
                displayName: 'April 2016 - March 2017',
                endDate: '2017-03-31',
                id: '2016April',
                iso: '2016April',
                name: 'April 2016 - March 2017',
                periodType: 'FYAPR',
                startDate: '2016-04-01',
            },
            {
                displayName: 'April 2015 - March 2016',
                endDate: '2016-03-31',
                id: '2015April',
                iso: '2015April',
                name: 'April 2015 - March 2016',
                periodType: 'FYAPR',
                startDate: '2015-04-01',
            },
            {
                displayName: 'April 2014 - March 2015',
                endDate: '2015-03-31',
                id: '2014April',
                iso: '2014April',
                name: 'April 2014 - March 2015',
                periodType: 'FYAPR',
                startDate: '2014-04-01',
            },
            {
                displayName: 'April 2013 - March 2014',
                endDate: '2014-03-31',
                id: '2013April',
                iso: '2013April',
                name: 'April 2013 - March 2014',
                periodType: 'FYAPR',
                startDate: '2013-04-01',
            },
            {
                displayName: 'April 2012 - March 2013',
                endDate: '2013-03-31',
                id: '2012April',
                iso: '2012April',
                name: 'April 2012 - March 2013',
                periodType: 'FYAPR',
                startDate: '2012-04-01',
            },
            {
                displayName: 'April 2011 - March 2012',
                endDate: '2012-03-31',
                id: '2011April',
                iso: '2011April',
                name: 'April 2011 - March 2012',
                periodType: 'FYAPR',
                startDate: '2011-04-01',
            },
        ])
    })

    test('getFixedPeriodsByType YEARLY 2020', () => {
        expect(
            getFixedPeriodsByType({
                periodType: 'YEARLY',
                year: 2020,
                periodsSettings: {
                    locale: 'en',
                    calendar: 'gregory',
                },
            })
        ).toStrictEqual([
            {
                displayName: '2020',
                endDate: '2020-12-31',
                id: '2020',
                iso: '2020',
                name: '2020',
                periodType: 'YEARLY',
                startDate: '2020-01-01',
            },
            {
                displayName: '2019',
                endDate: '2019-12-31',
                id: '2019',
                iso: '2019',
                name: '2019',
                periodType: 'YEARLY',
                startDate: '2019-01-01',
            },
            {
                displayName: '2018',
                endDate: '2018-12-31',
                id: '2018',
                iso: '2018',
                name: '2018',
                periodType: 'YEARLY',
                startDate: '2018-01-01',
            },
            {
                displayName: '2017',
                endDate: '2017-12-31',
                id: '2017',
                iso: '2017',
                name: '2017',
                periodType: 'YEARLY',
                startDate: '2017-01-01',
            },
            {
                displayName: '2016',
                endDate: '2016-12-31',
                id: '2016',
                iso: '2016',
                name: '2016',
                periodType: 'YEARLY',
                startDate: '2016-01-01',
            },
            {
                displayName: '2015',
                endDate: '2015-12-31',
                id: '2015',
                iso: '2015',
                name: '2015',
                periodType: 'YEARLY',
                startDate: '2015-01-01',
            },
            {
                displayName: '2014',
                endDate: '2014-12-31',
                id: '2014',
                iso: '2014',
                name: '2014',
                periodType: 'YEARLY',
                startDate: '2014-01-01',
            },
            {
                displayName: '2013',
                endDate: '2013-12-31',
                id: '2013',
                iso: '2013',
                name: '2013',
                periodType: 'YEARLY',
                startDate: '2013-01-01',
            },
            {
                displayName: '2012',
                endDate: '2012-12-31',
                id: '2012',
                iso: '2012',
                name: '2012',
                periodType: 'YEARLY',
                startDate: '2012-01-01',
            },
            {
                displayName: '2011',
                endDate: '2011-12-31',
                id: '2011',
                iso: '2011',
                name: '2011',
                periodType: 'YEARLY',
                startDate: '2011-01-01',
            },
        ])
    })

    test('getFixedPeriodsByType - MONTHLY 2020', () => {
        expect(
            getFixedPeriodsByType({
                periodType: 'MONTHLY',
                year: 2020,
                periodsSettings: {
                    locale: 'en',
                    calendar: 'gregory',
                },
            })
        ).toStrictEqual([
            {
                displayName: 'December 2020',
                endDate: '2020-12-31',
                id: '202012',
                iso: '202012',
                name: 'December 2020',
                periodType: 'MONTHLY',
                startDate: '2020-12-01',
            },
            {
                displayName: 'November 2020',
                endDate: '2020-11-30',
                id: '202011',
                iso: '202011',
                name: 'November 2020',
                periodType: 'MONTHLY',
                startDate: '2020-11-01',
            },
            {
                displayName: 'October 2020',
                endDate: '2020-10-31',
                id: '202010',
                iso: '202010',
                name: 'October 2020',
                periodType: 'MONTHLY',
                startDate: '2020-10-01',
            },
            {
                displayName: 'September 2020',
                endDate: '2020-09-30',
                id: '202009',
                iso: '202009',
                name: 'September 2020',
                periodType: 'MONTHLY',
                startDate: '2020-09-01',
            },
            {
                displayName: 'August 2020',
                endDate: '2020-08-31',
                id: '202008',
                iso: '202008',
                name: 'August 2020',
                periodType: 'MONTHLY',
                startDate: '2020-08-01',
            },
            {
                displayName: 'July 2020',
                endDate: '2020-07-31',
                id: '202007',
                iso: '202007',
                name: 'July 2020',
                periodType: 'MONTHLY',
                startDate: '2020-07-01',
            },
            {
                displayName: 'June 2020',
                endDate: '2020-06-30',
                id: '202006',
                iso: '202006',
                name: 'June 2020',
                periodType: 'MONTHLY',
                startDate: '2020-06-01',
            },
            {
                displayName: 'May 2020',
                endDate: '2020-05-31',
                id: '202005',
                iso: '202005',
                name: 'May 2020',
                periodType: 'MONTHLY',
                startDate: '2020-05-01',
            },
            {
                displayName: 'April 2020',
                endDate: '2020-04-30',
                id: '202004',
                iso: '202004',
                name: 'April 2020',
                periodType: 'MONTHLY',
                startDate: '2020-04-01',
            },
            {
                displayName: 'March 2020',
                endDate: '2020-03-31',
                id: '202003',
                iso: '202003',
                name: 'March 2020',
                periodType: 'MONTHLY',
                startDate: '2020-03-01',
            },
            {
                displayName: 'February 2020',
                endDate: '2020-02-29',
                id: '202002',
                iso: '202002',
                name: 'February 2020',
                periodType: 'MONTHLY',
                startDate: '2020-02-01',
            },
            {
                displayName: 'January 2020',
                endDate: '2020-01-31',
                id: '202001',
                iso: '202001',
                name: 'January 2020',
                periodType: 'MONTHLY',
                startDate: '2020-01-01',
            },
        ])
    })

    it('getPeriodsDurationByType - should correctly calculate the duration by type with deduplication', () => {
        const result = getPeriodsDurationByType(periods, periodsDetails)
        expect(result).toEqual({
            FIXED_PERIODS: {
                any: 1,
                first: 0,
                last: 0,
            },
            TYPE_A: { first: 1, last: 3 },
            TYPE_B: { first: 0, last: 2 },
        })
    })

    it('getPeriodsDurationByType - should correctly calculate the duration by type without deduplication', () => {
        const result = getPeriodsDurationByType(periods, periodsDetails, false)
        expect(result).toEqual({
            1: { any: 3 },
            2: { any: 2 },
            3: { any: 4 },
            4: { any: 1 },
        })
    })
})
