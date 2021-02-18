import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { IconChevronDown24 } from '@dhis2/ui';
import { hcl } from 'd3-color';
import cx from 'classnames';
import styles from './styles/ColorPicker.module.css';

const ColorPicker = ({ color, label, width, height, onChange, className }) => (
    <Fragment>
        <div className={cx(styles.colorPicker, className)}>
            {label && <div className={styles.label}>{label}</div>}
            <label
                style={{
                    backgroundColor: color,
                    width: width || '100%',
                    height: height || 32,
                }}
            >
                <span
                    className={cx(styles.icon, {
                        [styles.dark]: hcl(color).l > 70,
                    })}
                >
                    <IconChevronDown24 />
                </span>
                <input
                    type="color"
                    value={color}
                    onChange={e => onChange(e.target.value.toUpperCase())}
                />
            </label>
        </div>
    </Fragment>
);

ColorPicker.propTypes = {
    color: PropTypes.string.isRequired,
    label: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default ColorPicker;
