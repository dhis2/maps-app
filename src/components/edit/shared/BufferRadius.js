import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import cx from 'classnames';
import Checkbox from '../../core/Checkbox';
import NumberField from '../../core/NumberField';
import { setBufferRadius } from '../../../actions/layerEdit';
import styles from './styles/BufferRadius.module.css';

const BufferRadius = ({
    radius,
    defaultRadius = 1000,
    disabled,
    className,
    setBufferRadius,
}) => {
    const showBuffer = radius !== undefined && radius !== null;

    return (
        <div className={cx(styles.buffer, className)}>
            <Checkbox
                label={i18n.t('Buffer')}
                checked={showBuffer}
                disabled={disabled}
                onChange={isChecked =>
                    setBufferRadius(isChecked ? radius || defaultRadius : null)
                }
            />
            {showBuffer && (
                <NumberField
                    label={i18n.t('Radius in meters')}
                    value={radius || ''}
                    disabled={disabled}
                    onChange={value =>
                        setBufferRadius(value !== '' ? parseInt(value, 10) : '')
                    }
                />
            )}
        </div>
    );
};

BufferRadius.propTypes = {
    radius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    defaultRadius: PropTypes.number,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    setBufferRadius: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        radius: layerEdit.areaRadius,
    }),
    { setBufferRadius }
)(BufferRadius);
