import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import ArrowDropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ChromePicker from 'react-color/lib/components/chrome/Chrome';
import { hcl } from 'd3-color';

const styles = {
    label: {
        color: 'rgba(0, 0, 0, 0.3)',
        fontSize: 12,
        paddingBottom: 6,
        marginTop: 18,
    },
};

export default class ColorPicker extends Component {
    static propTypes = {
        color: PropTypes.string.isRequired,
        label: PropTypes.string,
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
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
        const { label, width, height, style } = this.props;
        const { color, isOpen, anchorEl } = this.state;

        return (
            <div style={style}>
                {label && <div style={styles.label}>{label}</div>}
                <IconButton
                    onClick={this.handleOpen}
                    style={{
                        background: color,
                        width: width || '100%',
                        height: height || 26,
                        padding: 0,
                        textAlign: 'right',
                    }}
                    disableTouchRipple={true}
                >
                    <ArrowDropDownIcon
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
