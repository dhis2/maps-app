import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import ArrowDropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ChromePicker from 'react-color/lib/components/chrome/Chrome';
import { hcl } from 'd3-color';

const styles = {
    wrapper: {
        display: 'inline-block',
    },
    color: {
        padding: 0,
        textAlign: 'right',
    },
};

export default class ColorPicker extends Component {
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
        const { color, isOpen, anchorEl } = this.state;

        return (
            <div style={styles.wrapper}>
                <IconButton
                    onClick={this.handleOpen}
                    style={{
                        ...styles.color,
                        background: color,
                        ...this.props.style,
                    }}
                    disableTouchRipple={true}
                >
                    <ArrowDropDownIcon // TODO: Switch to d2-ui cmp
                        color={hcl(color).l < 70 ? '#fff' : '#333'}
                    />
                </IconButton>

                <Popover
                    open={isOpen}
                    onRequestClose={this.handleClose}
                    anchorEl={anchorEl}
                >
                    <ChromePicker color={color} onChange={this.handleChange} />
                </Popover>
            </div>
        );
    }
}
