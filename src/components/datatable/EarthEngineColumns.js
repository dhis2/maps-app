import React from 'react';
import PropTypes from 'prop-types';
import { Column } from 'react-virtualized';
import ColumnHeader from './ColumnHeader';
import { numberPrecision } from '../../util/numbers';

const EarthEngineColumns = ({ classes, aggregationType, legend }) => {
    if (classes && legend && legend.items) {
        const { items } = legend;
        const valueFormat = numberPrecision(2); // TODO configurable

        return items.map(({ id, name }) => (
            <Column
                key={id}
                dataKey={name}
                label={name}
                width={100}
                className="right"
                headerRenderer={props => (
                    <ColumnHeader type="number" {...props} />
                )}
                cellRenderer={d =>
                    d.cellData !== undefined ? valueFormat(d.cellData) : ''
                }
            />
        ));
    } else if (Array.isArray(aggregationType)) {
        return aggregationType.map(type => (
            <Column
                key={type}
                dataKey={type}
                label={type}
                width={100}
                className="right"
                headerRenderer={props => (
                    <ColumnHeader type="number" {...props} />
                )}
                cellRenderer={d => d.cellData}
            />
        ));
    }

    return null;
};

EarthEngineColumns.propTypes = {
    classes: PropTypes.bool,
    aggregationType: PropTypes.array,
    legend: PropTypes.object,
};

export default EarthEngineColumns;
