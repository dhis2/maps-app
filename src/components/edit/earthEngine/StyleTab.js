import React from 'react';
import PropTypes from 'prop-types';
import StyleSelect from './StyleSelect';
import BufferRadius from '../shared/BufferRadius';
import LegendPreview from './LegendPreview';
import { EE_BUFFER } from '../../../constants/layers';
import styles from '../styles/LayerDialog.module.css';

const StyleTab = ({ unit, params, hasOrgUnitField }) => (
    <div className={styles.flexColumnFlow}>
        <div className={styles.flexColumn}>
            {params && <StyleSelect unit={unit} params={params} />}
            <BufferRadius
                defaultRadius={EE_BUFFER}
                hasOrgUnitField={hasOrgUnitField}
            />
        </div>
        {params && <LegendPreview params={params} />}
    </div>
);

StyleTab.propTypes = {
    unit: PropTypes.string.isRequired,
    params: PropTypes.shape({
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        palette: PropTypes.string.isRequired,
    }),
    hasOrgUnitField: PropTypes.bool.isRequired,
};

export default StyleTab;
