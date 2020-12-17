import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import SelectField from '../../core/SelectField';
import { getEarthEngineAggregationTypes } from '../../../constants/aggregationTypes';
import { setAggregationType } from '../../../actions/layerEdit';

const AggregationTypesSelect = ({ aggregationType, setAggregationType }) => {
    const types = getEarthEngineAggregationTypes();

    return (
        <div>
            <SelectField
                label={i18n.t('Aggregation')}
                items={types}
                multiple={true}
                value={aggregationType}
                onChange={setAggregationType}
            />
        </div>
    );
};

AggregationTypesSelect.propTypes = {
    aggregationType: PropTypes.array,
    setAggregationType: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        aggregationType: layerEdit.aggregationType,
    }),
    { setAggregationType }
)(AggregationTypesSelect);
