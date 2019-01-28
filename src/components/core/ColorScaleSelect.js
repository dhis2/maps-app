import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import ColorScale from './ColorScale';
import { colorScales, getColorScale, getColorPalette } from '../../util/colors';

const styles = {
    scale: {
        marginTop: 19,
        overflow: 'visible',
        whiteSpace: 'nowrap',
    },
    scaleItem: {
        display: 'block',
        margin: '5px 12px 0 12px',
        overflow: 'visible',
        whiteSpace: 'nowrap',
    },
};

class ColorScaleSelect extends Component {
    static propTypes = {
        palette: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        width: PropTypes.number,
        style: PropTypes.object,
        classes: PropTypes.object.isRequired,
    };

    constructor(...args) {
        super(...args);

        this.state = {
            open: false,
            anchorEl: null,
        };
    }

    // Show popover with allowed color scales
    showColorScales = event => {
        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    };

    hideColorScales() {
        this.setState({
            open: false,
        });
    }

    // Called when a new color scale is selected in the popover
    onColorScaleSelect = scale => {
        const { palette, onChange } = this.props;
        const classes = palette.split(',').length;

        onChange(getColorPalette(scale, classes));
        this.hideColorScales();
    };

    render() {
        const { palette, width, style, classes } = this.props;
        const bins = palette.split(',').length;
        const scale = getColorScale(palette);

        return (
            <div style={style}>
                <ColorScale
                    bins={bins}
                    scale={scale}
                    onClick={this.showColorScales}
                    className={classes.scale}
                    width={width || 260}
                />
                <Popover
                    classes={{ paper: classes.popover }}
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                    onClose={() => this.hideColorScales()}
                >
                    {colorScales.map((scale, index) => (
                        <ColorScale
                            key={index}
                            scale={scale}
                            bins={bins}
                            style={styles.scaleItem}
                            onClick={(event, scale) =>
                                this.onColorScaleSelect(scale)
                            }
                            width={width || 260}
                        />
                    ))}
                </Popover>
            </div>
        );
    }
}

export default withStyles(styles)(ColorScaleSelect);
