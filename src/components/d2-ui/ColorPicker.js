import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import ArrowDropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ChromePicker from 'react-color/lib/components/chrome/Chrome';
import { hcl } from 'd3-color';

const styles = {
    wrapper: {
        position: 'relative',
        display: 'inline-block',
    },
    color: {
        padding: 0,
        textAlign: 'right',
    },
    cover: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,

    },
    picker: {
        position: 'absolute',
        zIndex: 2000,
        top: 0,
        left: 72,
    }
};

export default class ColorPicker extends Component {
    constructor(...args) {
        super(...args);

        this.state = {
            isOpen: false,
            color: this.props.color,
        };
    }

    handleOpen = () => {
        this.setState({ isOpen: true });
    };

    handleClose = () => {
        this.setState({ isOpen: false });
    };

    handleChange = (color) => {
        const hexColor = color.hex.toUpperCase();

        this.setState({ color: hexColor });
        this.props.onChange(hexColor);
    };

    render() {
        const { color, isOpen } = this.state;

        return (
            <div style={styles.wrapper}>
                <IconButton
                    onClick={this.handleOpen}
                    style={{ ...styles.color, background: color, ...this.props.style }}
                    disableTouchRipple={true}
                >
                    <ArrowDropDownIcon // TODO: Switch to d2-ui cmp
                        color={hcl(color).l < 70 ? '#fff' : '#333'}
                        // style={{ position: 'absolute', bottom: 0 }}
                    />
                </IconButton>

                {isOpen ? <div is="popover">
                    <div style={styles.cover} onClick={this.handleClose}/>
                    <div style={styles.picker}>
                        <ChromePicker color={color} onChange={this.handleChange} />
                    </div>
                </div> : null}
            </div>
        )
    }
}

// <div style={styles.color} onClick={this.handleOpen}></div>