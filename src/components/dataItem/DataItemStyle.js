import React from 'react';
import PropTypes from 'prop-types';
import BooleanStyle from './BooleanStyle';
import OptionSetStyle from '../optionSet/OptionSetStyle';
import NumericLegendStyle from '../classification/NumericLegendStyle';

const numberTypes = ['NUMBER', 'INTEGER', 'AGE']; // TODO: Why value type AGE (TEI-Persopn-TB program)?

const DataItemStyle = ({ dataItem, style }) => {
    if (!dataItem) {
        return null;
    }

    const { valueType, optionSet } = dataItem;

    return (
        <div style={style}>
            {numberTypes.includes(valueType) ? (
                <NumericLegendStyle
                    dataItem={dataItem}
                    style={{ width: '100%' }}
                />
            ) : null}

            {valueType === 'BOOLEAN' ? <BooleanStyle /> : null}

            {optionSet ? <OptionSetStyle {...optionSet} /> : null}
        </div>
    );
};

DataItemStyle.propTypes = {
    dataItem: PropTypes.object,
    style: PropTypes.object,
};

export default DataItemStyle;
