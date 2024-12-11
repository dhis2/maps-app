import cx from 'classnames'
import { axisBottom } from 'd3-axis'
import { scaleTime } from 'd3-scale'
import { select } from 'd3-selection'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
    getPeriodTypeFromId,
    getPeriodLevelFromPeriodType,
} from '../../util/periods.js'
import { doubleTicksPeriods } from '../../constants/periods.js'
import timeTicks from '../../util/timeTicks.js'
import styles from './styles/Timeline.module.css'

// Constants
const PADDING_LEFT = 40
const PADDING_RIGHT = 20
const LABEL_WIDTH = 80
const RECT_HEIGHT = 8
const RECT_OFFSET = 8
const DELAY = 1500
const PLAY_ICON = <path d="M8 5v14l11-7z" />
const PAUSE_ICON = <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />

// Utility Functions
const addPeriodDetails = (period) => {
    const type = getPeriodTypeFromId(period.id)
    const level = getPeriodLevelFromPeriodType(type)
    return { ...period, type, level }
}

const getUniqueLevels = (periodsWithLevel) => [
    ...new Set(periodsWithLevel.map((item) => item.level)),
]

const countUniqueRanks = (periods) => {
    const periodsWithDetails = periods.map(addPeriodDetails)
    return getUniqueLevels(periodsWithDetails).length
}

const sortPeriodsByLevelRank = (periods) => {
    const periodsWithDetails = periods.map(addPeriodDetails)
    const sortedLevels = getUniqueLevels(periodsWithDetails).sort(
        (a, b) => b - a
    )
    return periodsWithDetails
        .map((item) => ({
            ...item,
            levelRank: sortedLevels.indexOf(item.level),
        }))
        .sort((a, b) => a.levelRank - b.levelRank)
}

const sortPeriodsByLevelAndStartDate = (periods) =>
    periods
        .map(addPeriodDetails)
        .sort((a, b) => b.level - a.level)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

// Timeline Component
class Timeline extends Component {
    static contextTypes = {
        map: PropTypes.object,
    }
    static propTypes = {
        period: PropTypes.object.isRequired,
        periods: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
    }
    state = {
        width: null,
        mode: 'start',
    }

    // Set time scale
    setTimeScale = () => {
        const { periods } = this.props
        const { width } = this.state

        if (!periods.length) {
            return
        }

        const { minStartDate, maxEndDate } = periods.reduce(
            (acc, { startDate, endDate }) => {
                const start = new Date(startDate)
                const end = new Date(endDate)
                return {
                    minStartDate:
                        start < acc.minStartDate ? start : acc.minStartDate,
                    maxEndDate: end > acc.maxEndDate ? end : acc.maxEndDate,
                }
            },
            {
                minStartDate: new Date(periods[0].startDate),
                maxEndDate: new Date(periods[0].endDate),
            }
        )

        // Link time domain to timeline width
        this.timeScale = scaleTime()
            .domain([minStartDate, maxEndDate])
            .range([0, width])
    }

    // Set timeline axis
    setTimeAxis = () => {
        const { periods } = this.props
        const periodsType = periods.map(({ id }) => getPeriodTypeFromId(id))
        const numPeriods =
            periods.length *
            (doubleTicksPeriods.some((element) => periodsType.includes(element))
                ? 2
                : 1)
        const { width } = this.state
        const maxTicks = Math.round(width / LABEL_WIDTH)
        const numTicks = Math.min(maxTicks, numPeriods)
        const ticks = timeTicks(...this.timeScale.domain(), numTicks)

        const timeAxis = axisBottom(this.timeScale).tickValues(ticks)
        select(this.node).call(timeAxis)
    }

    // Set timeline width from DOM element
    setWidth = () => {
        if (this.node) {
            // clientWith returns 0 for SVG elements in Firefox
            const box = this.node.parentNode.getBoundingClientRect()
            const width = box.right - box.left - PADDING_LEFT - PADDING_RIGHT
            this.setState({ width })
        }
    }

    // Play animation
    play = () => {
        const { period, periods, onChange } = this.props
        const sortedPeriods = sortPeriodsByLevelAndStartDate(periods)
        const currentIndex = sortedPeriods.findIndex((p) => p.id === period.id)
        const isLastPeriod = currentIndex === sortedPeriods.length - 1

        // If new animation
        if (!this.timeout) {
            // Switch to first period if last
            if (isLastPeriod) {
                onChange(sortedPeriods[0])
            }

            this.setState({ mode: 'play' })
        } else {
            // Stop animation if last period
            if (isLastPeriod) {
                this.stop()
                return
            }

            // Switch to next period
            onChange(sortedPeriods[currentIndex + 1])
        }

        // Call itself after DELAY
        this.timeout = setTimeout(this.play, DELAY)
    }

    // Stop animation
    stop = () => {
        this.setState({ mode: 'stop' })
        clearTimeout(this.timeout)
        delete this.timeout
    }

    // Handler for play/pause button
    onPlayPause = () => {
        if (this.state.mode === 'play') {
            this.stop()
        } else {
            this.play()
        }
    }

    // Handler for period click
    onPeriodClick(period) {
        // Switch to period if different
        if (period.id !== this.props.period.id) {
            this.props.onChange(period)
        }

        // Stop animation if running
        this.stop()
    }

    componentDidMount() {
        this.setWidth()
        this.context.map.on('resize', this.setWidth)
    }

    componentDidUpdate() {
        this.setTimeAxis()
    }

    componentWillUnmount() {
        this.context.map.off('resize', this.setWidth)
    }

    render() {
        const { mode } = this.state
        const uniqueRanks = countUniqueRanks(this.props.periods)
        const rectTotalHeight = RECT_HEIGHT + (uniqueRanks - 1) * RECT_OFFSET

        this.setTimeScale()
        return (
            <svg
                className={`dhis2-map-timeline ${styles.timeline}`}
                style={{
                    height: `${32 + rectTotalHeight}`,
                    bottom: `30`,
                }}
            >
                {/* Play/Pause Button */}
                <g
                    onClick={this.onPlayPause}
                    transform={`translate(7,${rectTotalHeight / 2})`}
                    className={styles.play}
                >
                    <path d="M0 0h24v24H0z" fillOpacity="0.0" />
                    {mode === 'play' ? PAUSE_ICON : PLAY_ICON}
                </g>
                {/* Period Rectangles */}
                <g transform={`translate(${PADDING_LEFT},10)`}>
                    {this.getPeriodRects()}
                </g>
                {/* X-Axis */}
                <g
                    transform={`translate(${PADDING_LEFT},${
                        12 + rectTotalHeight
                    })`}
                    ref={(node) => (this.node = node)}
                />
            </svg>
        )
    }

    // Returns array of period rectangles
    getPeriodRects = () => {
        const { period, periods } = this.props

        const sortedPeriods = sortPeriodsByLevelRank(periods)

        return sortedPeriods.map((item) => {
            const isCurrent = period.id === item.id
            const { id, startDate, endDate } = item
            const x = this.timeScale(startDate)
            const width = this.timeScale(endDate) - x

            return (
                <rect
                    key={id}
                    className={cx(styles.period, {
                        [styles.selected]: isCurrent,
                    })}
                    x={x}
                    y={item.levelRank * RECT_OFFSET}
                    width={width}
                    height={RECT_HEIGHT}
                    onClick={() => this.onPeriodClick(item)}
                />
            )
        })
    }
}

export default Timeline
