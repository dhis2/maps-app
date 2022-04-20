import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
import { axisBottom } from 'd3-axis';
import cx from 'classnames';
import timeTicks from '../../util/timeTicks';
import { scaleTime } from 'd3-scale';
import styles from './styles/Timeline.module.css';

const paddingLeft = 40;
const paddingRight = 20;
const labelWidth = 80;
const delay = 1500;
const playBtn = <path d="M8 5v14l11-7z" />;
const pauseBtn = <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />;
const doubleTicksPeriods = ['LAST_6_BIMONTHS', 'BIMONTHS_THIS_YEAR'];

export class Timeline extends Component {
    static contextTypes = {
        map: PropTypes.object,
    };

    static propTypes = {
        periodId: PropTypes.string.isRequired,
        period: PropTypes.object.isRequired,
        periods: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    state = {
        width: null,
        mode: 'start',
    };

    componentDidMount() {
        this.setWidth();
        this.context.map.on('resize', this.setWidth);
    }

    componentDidUpdate() {
        this.setTimeAxis();
    }

    componentWillUnmount() {
        this.context.map.off('resize', this.setWidth);
    }

    render() {
        const { mode } = this.state;

        this.setTimeScale();

        return (
            <svg className={`dhis2-map-timeline ${styles.timeline}`}>
                <g
                    onClick={this.onPlayPause}
                    transform="translate(7,5)"
                    className={styles.play}
                >
                    <path d="M0 0h24v24H0z" fillOpacity="0.0" />
                    {mode === 'play' ? pauseBtn : playBtn}
                </g>
                <g transform={`translate(${paddingLeft},10)`}>
                    {this.getPeriodRects()}
                </g>
                <g
                    transform={`translate(${paddingLeft},25)`}
                    ref={node => (this.node = node)}
                />
            </svg>
        );
    }

    // Returns array of period rectangles
    getPeriodRects = () => {
        const { period, periods } = this.props;

        return periods.map(item => {
            const isCurrent = period.id === item.id;
            const { id, startDate, endDate } = item;
            const x = this.timeScale(startDate);
            const width = this.timeScale(endDate) - x;

            // console.log('item', item);

            return (
                <rect
                    key={id}
                    className={cx(styles.period, {
                        [styles.selected]: isCurrent,
                    })}
                    x={x}
                    y="0"
                    width={width}
                    height="16"
                    onClick={() => this.onPeriodClick(item)}
                />
            );
        });
    };

    // Set time scale
    setTimeScale = () => {
        const { periods } = this.props;
        const { width } = this.state;

        if (!periods.length) {
            return;
        }

        const { startDate } = periods[0];
        const { endDate } = periods[periods.length - 1];

        // Link time domain to timeline width
        this.timeScale = scaleTime()
            .domain([startDate, endDate])
            .range([0, width]);
    };

    // Set timeline axis
    setTimeAxis = () => {
        const { periodId, periods } = this.props;
        const numPeriods =
            periods.length * (doubleTicksPeriods.includes(periodId) ? 2 : 1);
        const { width } = this.state;
        const maxTicks = Math.round(width / labelWidth);
        const numTicks = maxTicks < numPeriods ? maxTicks : numPeriods;
        const timeAxis = axisBottom(this.timeScale);
        const [startDate, endDate] = this.timeScale.domain();
        const ticks = timeTicks(startDate, endDate, numTicks);

        timeAxis.tickValues(ticks);

        select(this.node).call(timeAxis);
    };

    // Set timeline width from DOM el
    setWidth = () => {
        if (this.node) {
            // clientWith returns 0 for SVG elements in Firefox
            const box = this.node.parentNode.getBoundingClientRect();
            const width = box.right - box.left - paddingLeft - paddingRight;

            this.setState({ width });
        }
    };

    // Handler for period click
    onPeriodClick(period) {
        // Switch to period if different
        if (period.id !== this.props.period.id) {
            this.props.onChange(period);
        }

        // Stop animation if running
        this.stop();
    }

    // Handler for play/pause button
    onPlayPause = () => {
        if (this.state.mode === 'play') {
            this.stop();
        } else {
            this.play();
        }
    };

    // Play animation
    play = () => {
        const { period, periods, onChange } = this.props;
        const index = periods.findIndex(p => p.id === period.id);
        const isLastPeriod = index === periods.length - 1;

        // If new animation
        if (!this.timeout) {
            // Switch to first period if last
            if (isLastPeriod) {
                onChange(periods[0]);
            }

            this.setState({ mode: 'play' });
        } else {
            // Stop animation if last period
            if (isLastPeriod) {
                this.stop();
                return;
            }

            // Switch to next period
            onChange(periods[index + 1]);
        }

        // Call itself after delay
        this.timeout = setTimeout(this.play, delay);
    };

    // Stop animation
    stop = () => {
        this.setState({ mode: 'stop' });
        clearTimeout(this.timeout);
        delete this.timeout;
    };
}

export default Timeline;
