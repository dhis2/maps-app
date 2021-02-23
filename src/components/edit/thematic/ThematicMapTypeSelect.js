import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ImageSelect } from '../../core';
import { setThematicMapType } from '../../../actions/layerEdit';
import {
    THEMATIC_CHOROPLETH,
    getThematicMapTypes,
} from '../../../constants/layers';
import styles from '../styles/LayerDialog.module.css';

// Select between choropleth and bubble map for thematic layers
export const ThematicMapTypeSelect = ({
    type = THEMATIC_CHOROPLETH,
    setThematicMapType,
}) => (
    <div className={styles.flexInnerColumnFlow}>
        {getThematicMapTypes().map(({ id, name, image }) => (
            <ImageSelect
                key={id}
                id={id}
                img={image}
                title={name}
                onClick={setThematicMapType}
                isSelected={type === id}
                className={styles.flexInnerColumn}
            />
        ))}
    </div>
);

ThematicMapTypeSelect.propTypes = {
    type: PropTypes.string,
    setThematicMapType: PropTypes.func.isRequired,
};

export default connect(null, { setThematicMapType })(ThematicMapTypeSelect);
