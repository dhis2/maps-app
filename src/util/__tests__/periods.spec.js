import { getFixedPeriodsByType } from '../periods.js'

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
            })
        ).toStrictEqual([
            {
                endDate: '2020-07-31',
                id: '202007',
                iso: '202007',
                name: 'July 2020',
                startDate: '2020-07-01',
            },
            {
                endDate: '2020-06-30',
                id: '202006',
                iso: '202006',
                name: 'June 2020',
                startDate: '2020-06-01',
            },
            {
                endDate: '2020-05-31',
                id: '202005',
                iso: '202005',
                name: 'May 2020',
                startDate: '2020-05-01',
            },
            {
                endDate: '2020-04-30',
                id: '202004',
                iso: '202004',
                name: 'April 2020',
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
            })
        ).toStrictEqual([
            {
                endDate: '2020-12-31',
                id: '2020',
                iso: '2020',
                name: '2020',
                startDate: '2020-01-01',
            },
            {
                endDate: '2019-12-31',
                id: '2019',
                iso: '2019',
                name: '2019',
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
            getFixedPeriodsByType({ periodType: 'FYAPR', year: 2020 })
        ).toStrictEqual([
            {
                endDate: '2021-03-31',
                id: '2020April',
                name: 'April 2020 - March 2021',
                startDate: '2020-04-01',
            },
            {
                endDate: '2020-03-31',
                id: '2019April',
                name: 'April 2019 - March 2020',
                startDate: '2019-04-01',
            },
            {
                endDate: '2019-03-31',
                id: '2018April',
                name: 'April 2018 - March 2019',
                startDate: '2018-04-01',
            },
            {
                endDate: '2018-03-31',
                id: '2017April',
                name: 'April 2017 - March 2018',
                startDate: '2017-04-01',
            },
            {
                endDate: '2017-03-31',
                id: '2016April',
                name: 'April 2016 - March 2017',
                startDate: '2016-04-01',
            },
            {
                endDate: '2016-03-31',
                id: '2015April',
                name: 'April 2015 - March 2016',
                startDate: '2015-04-01',
            },
            {
                endDate: '2015-03-31',
                id: '2014April',
                name: 'April 2014 - March 2015',
                startDate: '2014-04-01',
            },
            {
                endDate: '2014-03-31',
                id: '2013April',
                name: 'April 2013 - March 2014',
                startDate: '2013-04-01',
            },
            {
                endDate: '2013-03-31',
                id: '2012April',
                name: 'April 2012 - March 2013',
                startDate: '2012-04-01',
            },
            {
                endDate: '2012-03-31',
                id: '2011April',
                name: 'April 2011 - March 2012',
                startDate: '2011-04-01',
            },
        ])
    })

    test('getFixedPeriodsByType YEARLY 2020', () => {
        expect(
            getFixedPeriodsByType({ periodType: 'YEARLY', year: 2020 })
        ).toStrictEqual([
            {
                endDate: '2020-12-31',
                id: '2020',
                iso: '2020',
                name: '2020',
                startDate: '2020-01-01',
            },
            {
                endDate: '2019-12-31',
                id: '2019',
                iso: '2019',
                name: '2019',
                startDate: '2019-01-01',
            },
            {
                endDate: '2018-12-31',
                id: '2018',
                iso: '2018',
                name: '2018',
                startDate: '2018-01-01',
            },
            {
                endDate: '2017-12-31',
                id: '2017',
                iso: '2017',
                name: '2017',
                startDate: '2017-01-01',
            },
            {
                endDate: '2016-12-31',
                id: '2016',
                iso: '2016',
                name: '2016',
                startDate: '2016-01-01',
            },
            {
                endDate: '2015-12-31',
                id: '2015',
                iso: '2015',
                name: '2015',
                startDate: '2015-01-01',
            },
            {
                endDate: '2014-12-31',
                id: '2014',
                iso: '2014',
                name: '2014',
                startDate: '2014-01-01',
            },
            {
                endDate: '2013-12-31',
                id: '2013',
                iso: '2013',
                name: '2013',
                startDate: '2013-01-01',
            },
            {
                endDate: '2012-12-31',
                id: '2012',
                iso: '2012',
                name: '2012',
                startDate: '2012-01-01',
            },
            {
                endDate: '2011-12-31',
                id: '2011',
                iso: '2011',
                name: '2011',
                startDate: '2011-01-01',
            },
        ])
    })
    test('getFixedPeriodsByType - MONTHLY 2020', () => {
        expect(
            getFixedPeriodsByType({ periodType: 'MONTHLY', year: 2020 })
        ).toStrictEqual([
            {
                endDate: '2020-12-31',
                id: '202012',
                iso: '202012',
                name: 'December 2020',
                startDate: '2020-12-01',
            },
            {
                endDate: '2020-11-30',
                id: '202011',
                iso: '202011',
                name: 'November 2020',
                startDate: '2020-11-01',
            },
            {
                endDate: '2020-10-31',
                id: '202010',
                iso: '202010',
                name: 'October 2020',
                startDate: '2020-10-01',
            },
            {
                endDate: '2020-09-30',
                id: '202009',
                iso: '202009',
                name: 'September 2020',
                startDate: '2020-09-01',
            },
            {
                endDate: '2020-08-31',
                id: '202008',
                iso: '202008',
                name: 'August 2020',
                startDate: '2020-08-01',
            },
            {
                endDate: '2020-07-31',
                id: '202007',
                iso: '202007',
                name: 'July 2020',
                startDate: '2020-07-01',
            },
            {
                endDate: '2020-06-30',
                id: '202006',
                iso: '202006',
                name: 'June 2020',
                startDate: '2020-06-01',
            },
            {
                endDate: '2020-05-31',
                id: '202005',
                iso: '202005',
                name: 'May 2020',
                startDate: '2020-05-01',
            },
            {
                endDate: '2020-04-30',
                id: '202004',
                iso: '202004',
                name: 'April 2020',
                startDate: '2020-04-01',
            },
            {
                endDate: '2020-03-31',
                id: '202003',
                iso: '202003',
                name: 'March 2020',
                startDate: '2020-03-01',
            },
            {
                endDate: '2020-02-29',
                id: '202002',
                iso: '202002',
                name: 'February 2020',
                startDate: '2020-02-01',
            },
            {
                endDate: '2020-01-31',
                id: '202001',
                iso: '202001',
                name: 'January 2020',
                startDate: '2020-01-01',
            },
        ])
    })
})
