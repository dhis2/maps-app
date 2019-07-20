import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { select } from 'd3-selection';
import { scaleTime } from 'd3-scale';
import { axisBottom } from 'd3-axis';

const styles = theme => ({
    root: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        boxShadow: theme.shadows[1],
        borderRadius: theme.shape.borderRadius,
        width: 'calc(100% - 20px)',
        position: 'absolute',
        left: 10,
        bottom: 28,
        height: 48,
        zIndex: 1000,
        userSelect: 'none',
    },
    play: {
        cursor: 'pointer',
        fill: '#333',
        '&:hover': {
            fill: '#000',
        },
    },
    period: {
        fill: '#333',
        stroke: '#555',
        strokeWidth: 1,
        fillOpacity: 0.1,
        cursor: 'pointer',
        '&.selected': {
            fill: '#2b675c',
            fillOpacity: 0.9,
        },
        '&:hover': {
            '&:not(.selected)': {
                fillOpacity: 0.2,
            },
        },
    },
});

const paddingLeft = 40;
const paddingRight = 20;
const labelWidth = 80;
const delay = 1500;
const playBtn = <path d="M8 5v14l11-7z" />;
const pauseBtn = <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />;

// https://github.com/d3/d3-scale
// https://github.com/d3/d3-axis/
// https://observablehq.com/@d3/d3-scaletime
class Timeline extends Component {
    static propTypes = {
        period: PropTypes.object.isRequired,
        periods: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    state = {
        width: null,
        mode: 'start',
    };

    componentDidMount() {
        this.setWidth();
        window.addEventListener('resize', this.setWidth);
    }

    componentDidUpdate() {
        this.setTimeAxis();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setWidth);
    }

    render() {
        const { classes } = this.props;
        const { mode } = this.state;

        return (
            <svg className={classes.root}>
                <g
                    onClick={this.onPlayPause}
                    transform="translate(7,5)"
                    className={classes.play}
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

    getPeriodRects = () => {
        const { period, periods, classes } = this.props;

        if (!this.timeScale) {
            this.setTimeScale();
        } else {
            this.timeScale.range([0, this.state.width]);
        }

        return periods.map(item => {
            const isCurrent = period.id === item.id;
            const { id, startDate, endDate } = item;
            const x = this.timeScale(startDate);
            const width = this.timeScale(endDate) - x;
            const className = `${classes.period}${
                isCurrent ? ` selected` : ''
            }`;

            return (
                <rect
                    key={id}
                    className={className}
                    x={x}
                    y="0"
                    width={width}
                    height="16"
                    onClick={() => this.onPeriodClick(item)}
                />
            );
        });
    };

    setTimeScale = () => {
        const { periods } = this.props;
        const { width } = this.state;
        const { startDate } = periods[0];
        const { endDate } = periods[periods.length - 1];

        // TODO: Support localized time
        // https://bl.ocks.org/mbostock/805115ebaa574e771db1875a6d828949

        this.timeScale = scaleTime()
            .domain([startDate, endDate])
            .range([0, width])
            .nice();
    };

    setTimeAxis = () => {
        const { width } = this.state;
        const ticks = Math.round(width / labelWidth);
        const timeAxis = axisBottom(this.timeScale).ticks(ticks);

        select(this.node).call(timeAxis);
    };

    setWidth = () => {
        const width =
            this.node.parentNode.clientWidth - paddingLeft - paddingRight;
        this.setState({ width });
    };

    onPeriodClick(period) {
        if (period.id !== this.props.period.id) {
            this.props.onChange(period);
        }
        this.stop();
    }

    onPlayPause = () => {
        if (this.state.mode === 'play') {
            this.stop();
        } else {
            this.play();
        }
    };

    play = () => {
        const { period, periods, onChange } = this.props;
        const index = periods.findIndex(p => p.id === period.id);
        const isLastPeriod = index === periods.length - 1;

        if (this.timeout) {
            if (isLastPeriod) {
                this.stop();
                return;
            }

            onChange(periods[index + 1]);
        } else {
            if (isLastPeriod) {
                onChange(periods[0]);
            }

            this.setState({ mode: 'play' });
        }

        this.timeout = setTimeout(this.play, delay);
    };

    stop = () => {
        this.setState({ mode: 'stop' });
        clearTimeout(this.timeout);
        delete this.timeout;
    };
}

export default withStyles(styles)(Timeline);
