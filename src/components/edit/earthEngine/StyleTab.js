import React from 'react';
import PropTypes from 'prop-types';
import StyleSelect from './StyleSelect';
import BufferRadius from '../shared/BufferRadius';
import LegendPreview from './LegendPreview';
import { EE_BUFFER } from '../../../constants/layers';
import styles from '../styles/LayerDialog.module.css';

const StyleTab = ({ unit, params, geometryAttribute }) => {
    const hasGeometryAttribute =
        geometryAttribute && geometryAttribute.id !== 'none';

    return (
        <div className={styles.flexColumnFlow}>
            <div className={styles.flexColumn}>
                {params && <StyleSelect unit={unit} params={params} />}
                <BufferRadius
                    defaultRadius={EE_BUFFER}
                    disabled={hasGeometryAttribute}
                />
            </div>
            {params && <LegendPreview params={params} />}
        </div>
    );
};

StyleTab.propTypes = {
    unit: PropTypes.string.isRequired,
    params: PropTypes.shape({
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        palette: PropTypes.string.isRequired,
    }),
    geometryAttribute: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
};

export default StyleTab;
