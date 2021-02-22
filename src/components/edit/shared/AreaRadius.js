import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import Checkbox from '../../core/Checkbox';
import NumberField from '../../core/NumberField';
import { setAreaRadius } from '../../../actions/layerEdit';

const defaultRadius = 5000;

const AreaRadius = ({ radius, setAreaRadius }) => {
    const showBuffer = radius !== undefined && radius !== null;

    return (
        <div>
            <Checkbox
                label={i18n.t('Buffer')}
                checked={showBuffer}
                onChange={isChecked =>
                    setAreaRadius(isChecked ? radius || defaultRadius : null)
                }
                // className={styles.checkboxInline}
            />
            {showBuffer && (
                <NumberField
                    label={i18n.t('Radius in meters')}
                    value={radius || ''}
                    onChange={setAreaRadius}
                />
            )}
        </div>
    );
};

AreaRadius.propTypes = {
    radius: PropTypes.number,
    setAreaRadius: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        radius: layerEdit.areaRadius,
    }),
    { setAreaRadius }
)(AreaRadius);
