import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setThematicMapType } from '../../../actions/layerEdit.js'
import {
    THEMATIC_CHOROPLETH,
    getThematicMapTypes,
} from '../../../constants/layers.js'
import { ImageSelect } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'

// Select between choropleth and bubble map for thematic layers
const ThematicMapTypeSelect = ({
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
)

ThematicMapTypeSelect.propTypes = {
    setThematicMapType: PropTypes.func.isRequired,
    type: PropTypes.string,
}

export default connect(null, { setThematicMapType })(ThematicMapTypeSelect)
