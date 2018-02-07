import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import ColorScale from 'd2-ui/lib/legend/ColorScale.component';
import Popover from 'material-ui/Popover/Popover';
import { colorScales, getColorScale, getColorPalette } from '../../util/colorscale';

const styles = {
    container: {
        width: '100%',
        textAlign: 'center',
    },
    scale: {
        marginTop: 19,
        overflow: 'visible',
        whiteSpace: 'nowrap',

    },
    popover: {
        height: '100%',
    },
    scaleItem: {
        display: 'block',
        margin: '5px 5px 0 5px'
    },
};

class ColorScaleSelect extends Component {
    constructor(...args) {
        super(...args);

        this.state = {
            open: false,
            anchorEl: null,
        };
    }

    // Show popover with allowed color scales
    showColorScales = (event) => {
        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    };

    hideColorScales() {
        this.setState({
            open: false
        });
    };

    // Called when a new color scale is selected in the popover
    onColorScaleSelect = (event, scale) => {
        const { palette, onChange } = this.props;
        const classes = palette.split(',').length;

        onChange(getColorPalette(scale, classes));
        this.hideColorScales();
    };

    render() {
        const { palette, style } = this.props;
        const classes = palette.split(',').length;
        const scale = getColorScale(palette);

        return (
            <div style={style}>
                <ColorScale
                    classes={classes}
                    scale={scale}
                    onClick={this.showColorScales}
                    style={styles.scale}
                />
                <Popover
                    style={styles.popover}
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                    onRequestClose={() => this.hideColorScales()}
                >
                    {colorScales.map((scale, index) =>
                        <ColorScale
                            key={index}
                            scale={scale}
                            classes={classes}
                            style={styles.scaleItem}
                            onClick={this.onColorScaleSelect}
                        />,
                    )}
              </Popover>
            </div>
        );
    }
}



export default ColorScaleSelect;
