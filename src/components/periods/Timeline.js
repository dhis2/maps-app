import cx from 'classnames'
import { axisBottom } from 'd3-axis'
import { scaleTime } from 'd3-scale'
import { select } from 'd3-selection'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import timeTicks from '../../util/timeTicks.js'
import styles from './styles/Timeline.module.css'
import { PERIOD_TYPE_REGEX } from '@dhis2/analytics'

const paddingLeft = 40
const paddingRight = 20
const labelWidth = 80
const delay = 1500
const playBtn = <path d="M8 5v14l11-7z" />
const pauseBtn = <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
const doubleTicksPeriods = ['LAST_6_BIMONTHS', 'BIMONTHS_THIS_YEAR']

const addPeriodType = (item) => {
    const periodTypes = Object.keys(PERIOD_TYPE_REGEX)
    let i = 0
    let type = undefined
    let match = undefined

    while (i < periodTypes.length && !match) {
        type = periodTypes[i]
        match = item.id.match(PERIOD_TYPE_REGEX[type])
        i++
    }

    let level
    switch (type) {
        case 'DAILY':
            level = 0
            break
        case 'WEEKLY':
        case 'WEEKLYWED':
        case 'WEEKLYTHU':
        case 'WEEKLYSAT':
        case 'WEEKLYSUN':
            level = 1
            break
        case 'BIWEEKLY':
            level = 2
            break
        case 'MONTHLY':
            level = 3
            break
        case 'BIMONTHLY':
            level = 4
            break
        case 'QUARTERLY':
            level = 5
            break
        case 'SIXMONTHLY':
        case 'SIXMONTHLYAPR':
            level = 6
            break
        case 'YEARLY':
        case 'FYNOV':
        case 'FYOCT':
        case 'FYJUL':
        case 'FYAPR':
            level = 7
            break
        default:
            level = 8
    }

    item.type = type
    item.level = level

    return item
}

const countUniqueRanks = (periods) => {
    let periodsWithType = periods.map((item) => addPeriodType(item))
    const levels = [...new Set(periodsWithType.map((item) => item.level))]
    return levels.length
}

const sortPeriods = (periods) => {
    let periodsWithType = periods.map((item) => addPeriodType(item))

    const levels = [...new Set(periodsWithType.map((item) => item.level))].sort(
        (a, b) => b - a
    )

    periodsWithType = periodsWithType.map((item) => ({
        ...item,
        levelRank: levels.indexOf(item.level),
    }))

    const sortedPeriods = periodsWithType.sort(
        (a, b) => a.levelRank - b.levelRank
    )

    return sortedPeriods
}

class Timeline extends Component {
    static contextTypes = {
        map: PropTypes.object,
    }

    static propTypes = {
        period: PropTypes.object.isRequired,
        periodId: PropTypes.string.isRequired,
        periods: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
    }

    state = {
        width: null,
        mode: 'start',
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

        this.setTimeScale()

        return (
            <svg
                className={`dhis2-map-timeline ${styles.timeline}`}
                height={40 + uniqueRanks * 4}
                bottom={24 + uniqueRanks * 4}
            >
                <g
                    onClick={this.onPlayPause}
                    transform="translate(7,10)"
                    className={styles.play}
                >
                    <path d="M0 0h24v24H0z" fillOpacity="0.0" />
                    {mode === 'play' ? pauseBtn : playBtn}
                </g>
                <g transform={`translate(${paddingLeft},10)`}>
                    {this.getPeriodRects()}
                </g>
                <g
                    transform={`translate(${paddingLeft},${
                        20 + uniqueRanks * 4
                    })`}
                    ref={(node) => (this.node = node)}
                />
            </svg>
        )
    }

    // Returns array of period rectangles
    getPeriodRects = () => {
        const { period, periods } = this.props

        const sortedPeriods = sortPeriods(periods)

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
                    y={item.levelRank * 4}
                    width={width}
                    height={10} //{verticalScale(item).height}
                    onClick={() => this.onPeriodClick(item)}
                />
            )
        })
    }

    // Set time scale
    setTimeScale = () => {
        const { periods } = this.props
        console.log('🚀 ~ Timeline ~ this.props:', this.props)
        const { width } = this.state

        if (!periods.length) {
            return
        }

        const { minStartDate: startDate, maxEndDate: endDate } = periods.reduce(
            (acc, item) => {
                const start = new Date(item.startDate)
                const end = new Date(item.endDate)
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
            .domain([startDate, endDate])
            .range([0, width])
    }

    // Set timeline axis
    setTimeAxis = () => {
        const { periodId, periods } = this.props
        console.log('🚀 ~ Timeline ~ this.props:', this.props)
        const numPeriods =
            periods.length * (doubleTicksPeriods.includes(periodId) ? 2 : 1)
        const { width } = this.state
        const maxTicks = Math.round(width / labelWidth)
        const numTicks = maxTicks < numPeriods ? maxTicks : numPeriods
        const timeAxis = axisBottom(this.timeScale)
        const [startDate, endDate] = this.timeScale.domain()
        const ticks = timeTicks(startDate, endDate, numTicks)

        timeAxis.tickValues(ticks)

        select(this.node).call(timeAxis)
    }

    // Set timeline width from DOM el
    setWidth = () => {
        if (this.node) {
            // clientWith returns 0 for SVG elements in Firefox
            const box = this.node.parentNode.getBoundingClientRect()
            const width = box.right - box.left - paddingLeft - paddingRight

            this.setState({ width })
        }
    }

    // Handler for period click
    onPeriodClick(period) {
        // Switch to period if different
        if (period.id !== this.props.period.id) {
            console.log(
                '🚀 ~ Timeline ~ onPeriodClick ~ this.props:',
                this.props
            )
            this.props.onChange(period)
        }
        console.log('🚀 ~ Timeline ~ onPeriodClick ~ this.props:', this.props)

        // Stop animation if running
        this.stop()
    }

    // Handler for play/pause button
    onPlayPause = () => {
        if (this.state.mode === 'play') {
            this.stop()
        } else {
            this.play()
        }
    }

    // Play animation
    play = () => {
        const { period, periods, onChange } = this.props
        console.log('🚀 ~ Timeline ~ this.props:', this.props)
        let sortedPeriods
        sortedPeriods = periods.sort((a, b) => b.level - a.level)
        sortedPeriods = periods.sort(
            (a, b) => new Date(a.startDate) - new Date(b.startDate)
        )
        const index = sortedPeriods.findIndex((p) => p.id === period.id)
        const isLastPeriod = index === sortedPeriods.length - 1

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
            onChange(sortedPeriods[index + 1])
        }

        // Call itself after delay
        this.timeout = setTimeout(this.play, delay)
    }

    // Stop animation
    stop = () => {
        this.setState({ mode: 'stop' })
        clearTimeout(this.timeout)
        delete this.timeout
    }
}

export default Timeline
