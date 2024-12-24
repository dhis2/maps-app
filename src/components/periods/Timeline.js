import cx from 'classnames'
import { axisBottom } from 'd3-axis'
import { scaleTime } from 'd3-scale'
import { select } from 'd3-selection'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
    addPeriodsDetails,
    sortPeriodsByLevelAndStartDate,
    checkLastPeriod,
    getMinMaxDates,
} from '../../util/periods.js'
import timeTicks from '../../util/timeTicks.js'
import styles from './styles/Timeline.module.css'

const PADDING_LEFT = 40
const PADDING_RIGHT = 20
const LABEL_WIDTH = 80
const RECT_HEIGHT = 8
const RECT_OFFSET = 8
const DELAY = 1500

const Timeline = ({ period, periods, onChange }) => {
    const { layersPanelOpen, rightPanelOpen } = useSelector((state) => state.ui)
    const [width, setWidth] = useState(null)
    const [mode, setMode] = useState('start')
    const [currentPeriod, setCurrentPeriod] = useState(period)
    const svgRef = useRef(null)
    const timeoutRef = useRef(null)

    const TRANSPARENT_RECT = <path d="M0 0h24v24H0z" fillOpacity="0.0" />
    const PLAY_ICON = <path d="M8 5v14l11-7z" className="play-icon" />
    const PAUSE_ICON = (
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" className="pause-icon" />
    )

    const updateWidth = useCallback(() => {
        if (svgRef.current) {
            const box = svgRef.current.parentNode?.getBoundingClientRect()
            const newWidth = box ? box.width - PADDING_LEFT - PADDING_RIGHT : 0
            setWidth(newWidth)
        }
    }, [])

    useEffect(() => {
        window.addEventListener('resize', updateWidth)
        updateWidth()
        return () => window.removeEventListener('resize', updateWidth)
    }, [updateWidth, layersPanelOpen, rightPanelOpen])

    const { periodsWithTypeLevelAndRank, distinctLevelsCount } = useMemo(
        () => addPeriodsDetails(periods),
        [periods]
    )

    const sortedPeriods = useMemo(
        () => sortPeriodsByLevelAndStartDate(periodsWithTypeLevelAndRank),
        [periodsWithTypeLevelAndRank]
    )

    const isLastPeriod = useMemo(
        () => checkLastPeriod(currentPeriod, sortedPeriods),
        [currentPeriod, sortedPeriods]
    )

    const timeScale = useMemo(() => {
        if (!sortedPeriods.length || !width) {
            return null
        }
        return scaleTime()
            .domain(getMinMaxDates(sortedPeriods))
            .range([0, width])
    }, [sortedPeriods, width])

    const setTimeAxis = useCallback(() => {
        if (!timeScale) {
            return
        }
        const maxTicks = Math.round(width / LABEL_WIDTH)
        const ticks = timeTicks(...timeScale.domain(), maxTicks)
        const timeAxis = axisBottom(timeScale).tickValues(ticks)
        select(svgRef.current).call(timeAxis)
    }, [timeScale, width])

    useEffect(() => {
        setTimeAxis()
    }, [timeScale, setTimeAxis])

    const play = useCallback(() => {
        timeoutRef.current = setTimeout(() => {
            const nextPeriod = sortedPeriods.find(
                (p) => p.startDate > currentPeriod.startDate
            )
            if (nextPeriod) {
                setCurrentPeriod(nextPeriod)
                onChange(nextPeriod)
            } else {
                setMode('pause')
            }
        }, DELAY)
        setMode('play')
    }, [sortedPeriods, currentPeriod, onChange])

    const pause = useCallback(() => {
        clearTimeout(timeoutRef.current)
        setMode('pause')
    }, [])

    useEffect(() => {
        mode === 'play' ? play() : pause()
        return () => clearTimeout(timeoutRef.current)
    }, [mode, play, pause])

    const onPlayPause = useCallback(() => {
        mode === 'play' ? pause() : play()
        if (isLastPeriod) {
            setCurrentPeriod(sortedPeriods[0])
            onChange(sortedPeriods[0])
        }
    }, [mode, isLastPeriod, play, pause, sortedPeriods, onChange])

    const onPeriodClick = (clickedPeriod) => {
        if (clickedPeriod.id !== period.id) {
            setCurrentPeriod(clickedPeriod)
            onChange(clickedPeriod)
        }
        pause()
    }

    const rectTotalHeight =
        RECT_HEIGHT + (distinctLevelsCount - 1) * RECT_OFFSET

    const getPeriodRects = (sortedPeriods, timeScale) => {
        return sortedPeriods.map((item) => {
            const isCurrent = period.id === item.id
            const x = timeScale(new Date(item.startDate))
            const width = timeScale(new Date(item.endDate)) - x

            return (
                <rect
                    key={item.id}
                    className={cx(styles.period, {
                        [styles.selected]: isCurrent,
                    })}
                    x={x}
                    y={item.levelRank * RECT_OFFSET}
                    width={width}
                    height={RECT_HEIGHT}
                    onClick={() => onPeriodClick(item)}
                />
            )
        })
    }

    return (
        <svg
            className={`dhis2-map-timeline ${styles.timeline}`}
            style={{
                height: `${32 + rectTotalHeight}px`,
                bottom: `30px`,
            }}
        >
            {/* Play/Pause Button */}
            <g
                onClick={onPlayPause}
                transform={`translate(7, ${rectTotalHeight / 2})`}
                className={styles.play}
            >
                {TRANSPARENT_RECT}
                {mode === 'play' ? PAUSE_ICON : PLAY_ICON}
            </g>
            {/* Period Rectangles */}
            {sortedPeriods && timeScale && (
                <g transform={`translate(${PADDING_LEFT}, 10)`}>
                    {getPeriodRects(sortedPeriods, timeScale)}
                </g>
            )}
            {/* X-Axis */}
            <g
                transform={`translate(${PADDING_LEFT}, ${
                    12 + rectTotalHeight
                })`}
                ref={svgRef}
            />
        </svg>
    )
}

Timeline.propTypes = {
    period: PropTypes.object.isRequired,
    periods: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default Timeline
