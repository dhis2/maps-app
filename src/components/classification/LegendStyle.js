import React from 'react';
import PropTypes from 'prop-types';
import LegendTypeSelect from './LegendTypeSelect';
import LegendSetSelect from './LegendSetSelect';
import Classification from './Classification';

// Wrapper component for selecting legend style used for numeric map styles
export const LegendStyle = ({
    method,
    legendSet,
    classes,
    colorScale,
    style,
}) => (
    <div style={style}>
        <LegendTypeSelect method={method} />
        {method === 1 ? (
            <LegendSetSelect legendSet={legendSet} />
        ) : (
            <Classification
                method={method}
                classes={classes}
                colorScale={colorScale}
            />
        )}
    </div>
);

LegendStyle.propTypes = {
    method: PropTypes.number,
    legendSet: PropTypes.object,
    classes: PropTypes.number,
    colorScale: PropTypes.string,
    style: PropTypes.object,
};

export default LegendStyle;
