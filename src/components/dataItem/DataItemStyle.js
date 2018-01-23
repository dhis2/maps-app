import React from 'react';
import BooleanStyle from './BooleanStyle';
import OptionSetStyle from '../optionSet/OptionSetStyle';
import Classification from '../style/Classification';

const DataElementStyle = ({ method, classes, colorScale, id, valueType, name, optionSet, style }) => (
    <div style={style}>
        {valueType === 'INTEGER' ?
            <Classification
                method={method}
                classes={classes}
                colorScale={colorScale}
                style={{ width: '100%' }}
            />
        : null}

        {valueType === 'BOOLEAN' ?
            <BooleanStyle />
        : null}

        {optionSet ?
            <OptionSetStyle
                {...optionSet}
            />
        : null}
    </div>
);

export default DataElementStyle;
