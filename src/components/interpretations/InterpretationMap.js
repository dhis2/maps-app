import React from 'react';
import PropTypes from 'prop-types';

const InterpretationMap = ({
    // visualization,
    // filters,
    // onResponsesReceived,
    className,
}) => {
    // console.log('InterpretationMap', visualization, filters);
    return <div className={className}>Map</div>;
};

InterpretationMap.propTypes = {
    visualization: PropTypes.object,
    filters: PropTypes.object,
    onResponsesReceived: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default InterpretationMap;
