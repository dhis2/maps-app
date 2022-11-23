import timeTicks from '../timeTicks'

describe('time ticks generation', () => {
    it('timeTicks(start, stop, count) can generate 1-week ticks that starts on Monday', () => {
        const startDate = new Date(2022, 3, 4)
        const stopDate = new Date(2022, 4, 1)
        const ticks = timeTicks(startDate, stopDate, 4)

        // getDay() === 1 is Monday
        expect(
            ticks.every((time) => new Date(time).getDay() === 1)
        ).toBeTruthy()
    })
})
