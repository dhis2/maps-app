import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import {
    addDimensionFilter,
    removeDimensionFilter,
    changeDimensionFilter,
} from '../../actions/layerEdit.js'
import DimensionFilterRow from './DimensionFilterRow.jsx'
import styles from './styles/DimensionFilter.module.css'

const DimensionFilter = ({
    dimensions = [],
    addDimensionFilter,
    changeDimensionFilter,
    removeDimensionFilter,
}) => (
    <div className={styles.dimensionFilter}>
        {dimensions.map((item, index) => (
            <DimensionFilterRow
                key={index}
                index={index}
                onChange={changeDimensionFilter}
                onRemove={removeDimensionFilter}
                {...item}
            />
        ))}
        <div className={styles.addFilter}>
            <Button basic onClick={() => addDimensionFilter()}>
                {i18n.t('Add filter')}
            </Button>
        </div>
    </div>
)

DimensionFilter.propTypes = {
    addDimensionFilter: PropTypes.func.isRequired,
    changeDimensionFilter: PropTypes.func.isRequired,
    removeDimensionFilter: PropTypes.func.isRequired,
    dimensions: PropTypes.array,
}

export default connect(null, {
    addDimensionFilter,
    removeDimensionFilter,
    changeDimensionFilter,
})(DimensionFilter)
