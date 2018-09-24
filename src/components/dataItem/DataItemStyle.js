import React from 'react';
import PropTypes from 'prop-types';
import BooleanStyle from './BooleanStyle';
import OptionSetStyle from '../optionSet/OptionSetStyle';
import NumericLegendStyle from '../classification/NumericLegendStyle';
import {
    numberValueTypes,
    booleanValueTypes,
} from '../../constants/valueTypes';

const DataItemStyle = ({ dataItem, style }) => {
    if (!dataItem) {
        return null;
    }

    const { valueType, optionSet } = dataItem;

    return (
        <div style={style}>
            {numberValueTypes.indexOf(valueType) !== -1 ? (
                <NumericLegendStyle
                    dataItem={dataItem}
                    style={{ width: '100%' }}
                />
            ) : null}

            {booleanValueTypes.indexOf(valueType) !== -1 ? (
                <BooleanStyle {...dataItem} />
            ) : null}

            {optionSet ? <OptionSetStyle {...optionSet} /> : null}
        </div>
    );
};

DataItemStyle.propTypes = {
    dataItem: PropTypes.object,
    style: PropTypes.object,
};

export default DataItemStyle;
