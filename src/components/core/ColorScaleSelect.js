import React, { Fragment, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Popover } from '@dhis2/ui';
import cx from 'classnames';
import ColorScale from './ColorScale';
import { colorScales, getColorScale, getColorPalette } from '../../util/colors';
import styles from './styles/ColorScaleSelect.module.css';

const ColorScaleSelect = ({ palette, width, onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef();

    const bins = palette.split(',').length;
    const scale = getColorScale(palette);

    const onColorScaleSelect = scale => {
        const classes = palette.split(',').length;
        onChange(getColorPalette(scale, classes));
        setIsOpen(false);
    };

    return (
        <Fragment>
            <div ref={anchorRef} className={cx(styles.colorScale, className)}>
                <ColorScale
                    bins={bins}
                    scale={scale}
                    onClick={() => setIsOpen(true)}
                    width={width || 260}
                />
            </div>
            {isOpen && (
                <Popover
                    reference={anchorRef}
                    arrow={false}
                    placement="right"
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div
                        className={styles.popover}
                        style={{ width: width + 24 || 260 }}
                    >
                        {colorScales.map((scale, index) => (
                            <ColorScale
                                key={index}
                                scale={scale}
                                bins={bins}
                                onClick={onColorScaleSelect}
                                width={width || 260}
                            />
                        ))}
                    </div>
                </Popover>
            )}
        </Fragment>
    );
};

ColorScaleSelect.propTypes = {
    palette: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    width: PropTypes.number,
    className: PropTypes.string,
};

export default ColorScaleSelect;
