import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Popover } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ChromePicker from 'react-color/lib/components/chrome/Chrome';
import { hcl } from 'd3-color';
import cx from 'classnames';
import styles from './styles/ColorPicker.module.css';

export class ColorPicker extends Component {
    static propTypes = {
        color: PropTypes.string.isRequired,
        label: PropTypes.string,
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
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
        const { label, width, height, className } = this.props;
        const { color, isOpen, anchorEl } = this.state;

        return (
            <div className={cx(styles.colorPicker, className)}>
                {label && <div className={styles.label}>{label}</div>}
                <IconButton
                    onClick={this.handleOpen}
                    className={styles.button}
                    style={{
                        background: color,
                        width: width || '100%',
                        height: height || 28,
                    }}
                    disableTouchRipple={true}
                >
                    <ArrowDropDownIcon
                        htmlColor={hcl(color).l < 70 ? '#fff' : '#333'}
                        className={styles.icon}
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

export default ColorPicker;
