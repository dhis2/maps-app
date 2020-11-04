import React, { Fragment, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Popover } from '@dhis2/ui';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ChromePicker from 'react-color/lib/components/chrome/Chrome';
import { hcl } from 'd3-color';
import cx from 'classnames';
import styles from './styles/ColorPicker.module.css';

const ColorPicker = ({ color, label, width, height, onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef();

    return (
        <Fragment>
            <div className={cx(styles.colorPicker, className)}>
                {label && <div className={styles.label}>{label}</div>}
                <div
                    ref={anchorRef}
                    onClick={() => setIsOpen(true)}
                    className={styles.button}
                    style={{
                        background: color,
                        width: width || '100%',
                        height: height || 40,
                    }}
                >
                    <span
                        className={styles.icon}
                        style={{ color: hcl(color).l < 70 ? '#fff' : '#333' }}
                    >
                        <ArrowDropDownIcon />
                    </span>
                </div>
            </div>
            {isOpen && (
                <Popover
                    reference={anchorRef}
                    arrow={false}
                    placement="right"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <ChromePicker
                        color={color}
                        onChange={color => onChange(color.hex.toUpperCase())}
                    />
                </Popover>
            )}
        </Fragment>
    );
};

ColorPicker.propTypes = {
    color: PropTypes.string.isRequired,
    label: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default ColorPicker;
