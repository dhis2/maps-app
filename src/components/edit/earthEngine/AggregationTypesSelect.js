import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import SelectField from '../../core/SelectField';
import {
    getEarthEngineAggregationTypes,
    getEarthEngineStatisticTypes,
} from '../../../constants/aggregationTypes';
import { setAggregationType } from '../../../actions/layerEdit';

const AggregationTypesSelect = ({
    classes = false,
    aggregationType,
    defaultAggregations,
    setAggregationType,
}) => {
    const types = classes
        ? getEarthEngineStatisticTypes()
        : getEarthEngineAggregationTypes();

    useEffect(() => {
        if (!aggregationType && defaultAggregations) {
            setAggregationType(defaultAggregations);
        }
    }, [aggregationType, defaultAggregations]);

    return (
        <div>
            <SelectField
                label={classes ? i18n.t('Statistics') : i18n.t('Aggregation')}
                items={types}
                multiple={!classes}
                value={aggregationType}
                onChange={type =>
                    setAggregationType(Array.isArray(type) ? type : [type.id])
                }
            />
        </div>
    );
};

AggregationTypesSelect.propTypes = {
    classes: PropTypes.bool,
    aggregationType: PropTypes.array,
    defaultAggregations: PropTypes.array,
    setAggregationType: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        classes: layerEdit.classes,
        aggregationType: layerEdit.aggregationType,
        defaultAggregations: layerEdit.defaultAggregations,
    }),
    { setAggregationType }
)(AggregationTypesSelect);
