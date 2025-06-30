import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Timeline from '../Timeline.jsx'

describe('Timeline', () => {
    const periodId = 'LAST_3_MONTHS'
    const period = { id: '201906', name: 'June 2019' }
    const periods = [
        {
            id: '201904',
            name: 'April 2019',
            startDate: new Date('2019-04-01T00:00:00.000'),
            endDate: new Date('2019-04-30T24:00:00.000'),
        },
        {
            id: '201905',
            name: 'May 2019',
            startDate: new Date('2019-05-01T00:00:00.000'),
            endDate: new Date('2019-05-31T24:00:00.000'),
        },
        {
            id: '201906',
            name: 'June 2019',
            startDate: new Date('2019-06-01T00:00:00.000'),
            endDate: new Date('2019-06-30T24:00:00.000'),
        },
    ]
    const periodOnChange = {
        id: '201904',
        name: 'April 2019',
        startDate: new Date('2019-04-01T00:00:00.000'),
        endDate: new Date('2019-04-30T24:00:00.000'),
        level: 7,
        levelRank: 0,
        type: 'MONTHLY',
    }
    const onChangeSpy = jest.fn()
    let props

    beforeEach(() => {
        props = {
            periodId,
            period,
            periods,
            onChange: onChangeSpy,
            classes: {},
        }
    })

    it('should render timeline', () => {
        const { container } = render(<Timeline {...props} />)
        expect(container).toMatchSnapshot()
    })

    it('should call onChange with the period clicked', async () => {
        render(<Timeline {...props} />)

        // Find the first rect element
        const rects = screen.getAllByRole('button')
        const firstRect = rects[0]

        await fireEvent.click(firstRect)

        expect(onChangeSpy).toHaveBeenCalledWith(periodOnChange)
    })

    it('Should toggle play mode when play/pause button is clicked', async () => {
        render(<Timeline {...props} />)

        // Find the play/pause button
        const playPauseBtn = screen.getByRole('button', { name: /Play/i })

        // Initially, the play icon should be visible, and the pause icon should not
        expect(screen.queryByTestId('play-button')).toBeInTheDocument()
        expect(screen.queryByTestId('pause-button')).not.toBeInTheDocument()

        // Simulate clicking the play/pause button
        await fireEvent.click(playPauseBtn)

        // After clicking, the pause icon should be visible, and the play icon should not
        expect(screen.queryByTestId('play-button')).not.toBeInTheDocument()
        expect(screen.queryByTestId('pause-button')).toBeInTheDocument()

        // Ensure the onChangeSpy was called with the correct argument
        expect(onChangeSpy).toHaveBeenCalledWith(periodOnChange)

        // Simulate clicking the play/pause button again
        await fireEvent.click(playPauseBtn)

        // After clicking again, the play icon should be visible, and the pause icon should not
        expect(screen.queryByTestId('play-button')).toBeInTheDocument()
        expect(screen.queryByTestId('pause-button')).not.toBeInTheDocument()
    })
})
