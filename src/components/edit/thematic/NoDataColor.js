import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import Checkbox from '../../core/Checkbox';
import ColorPicker from '../../core/ColorPicker';
import { NO_DATA_COLOR } from '../../../constants/layers';

const NoDataColor = ({ value, onChange, className }) => {
    const onCheck = useCallback(
        val => onChange(val ? NO_DATA_COLOR : undefined),
        []
    );

    return (
        <div className={className}>
            <Checkbox
                label={i18n.t('Show no data')}
                checked={!!value}
                onCheck={onCheck}
                style={{
                    margin: '0 40px 0 -4px',
                    height: 60,
                }}
            />
            {value && (
                <ColorPicker
                    label={i18n.t('Color')}
                    color={value}
                    onChange={onChange}
                    width={50}
                    style={{
                        display: 'inline-block',
                        marginTop: -6,
                    }}
                />
            )}
        </div>
    );
};

NoDataColor.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default NoDataColor;
