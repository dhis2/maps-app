import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Button } from '@dhis2/ui';
import DimensionFilterRow from './DimensionFilterRow';
import {
    addDimensionFilter,
    removeDimensionFilter,
    changeDimensionFilter,
} from '../../actions/layerEdit';
import styles from './styles/DimensionFilter.module.css';

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
            <Button primary onClick={() => addDimensionFilter()}>
                {i18n.t('Add filter')}
            </Button>
        </div>
    </div>
);

DimensionFilter.propTypes = {
    dimensions: PropTypes.array,
    addDimensionFilter: PropTypes.func.isRequired,
    removeDimensionFilter: PropTypes.func.isRequired,
    changeDimensionFilter: PropTypes.func.isRequired,
};

export default connect(null, {
    addDimensionFilter,
    removeDimensionFilter,
    changeDimensionFilter,
})(DimensionFilter);
