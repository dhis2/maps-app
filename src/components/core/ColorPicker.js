import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ChromePicker from 'react-color/lib/components/chrome/Chrome';
import { hcl } from 'd3-color';

const styles = {
    root: {
        margin: '12px 0',
    },
    button: {
        padding: 0,
        textAlign: 'right',
        borderRadius: 0,
    },
    icon: {
        position: 'absolute',
        right: 4,
    },
    label: {
        color: '#494949',
        fontSize: 14,
        paddingBottom: 6,
    },
};

export class ColorPicker extends Component {
    static propTypes = {
        color: PropTypes.string.isRequired,
        label: PropTypes.string,
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
        classes: PropTypes.object.isRequired,
    };

    constructor(...args) {
        super(...args);

        this.state = {
            isOpen: false,
            color: this.props.color,
        };
    }

    handleOpen = event => {
        this.setState({
            isOpen: true,
            anchorEl: event.currentTarget,
        });
    };

    handleClose = () => {
        this.setState({ isOpen: false });
    };

    handleChange = color => {
        const hexColor = color.hex.toUpperCase();

        this.setState({ color: hexColor });
        this.props.onChange(hexColor);
    };

    render() {
        const { label, width, height, style, classes } = this.props;
        const { color, isOpen, anchorEl } = this.state;

        return (
            <div className={classes.root} style={style}>
                {label && <div className={classes.label}>{label}</div>}
                <IconButton
                    onClick={this.handleOpen}
                    className={classes.button}
                    style={{
                        background: color,
                        width: width || '100%',
                        height: height || 28,
                    }}
                    disableTouchRipple={true}
                >
                    <ArrowDropDownIcon
                        nativeColor={hcl(color).l < 70 ? '#fff' : '#333'}
                        className={classes.icon}
                    />
                </IconButton>
                <Popover
                    open={isOpen}
                    onClose={this.handleClose}
                    anchorEl={anchorEl}
                >
                    <ChromePicker color={color} onChange={this.handleChange} />
                </Popover>
            </div>
        );
    }
}

export default withStyles(styles)(ColorPicker);
