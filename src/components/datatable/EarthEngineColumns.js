import React from 'react';
import PropTypes from 'prop-types';
import { Column } from 'react-virtualized';
import ColumnHeader from './ColumnHeader';
import { numberPrecision } from '../../util/numbers';
import { getCellData } from '../../util/earthEngine';

const EarthEngineColumns = ({
    classes,
    aggregationType,
    legend,
    aggregations,
}) => {
    const { title, items } = legend;

    if (classes && items) {
        const valueFormat = numberPrecision(2);

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
    } else if (Array.isArray(aggregationType) && aggregationType.length) {
        return aggregationType.map(type => {
            const cellData = getCellData(type, aggregations);

            return (
                <Column
                    key={type}
                    dataKey={type}
                    label={`${type} ${title}`.toUpperCase()}
                    width={100}
                    className="right"
                    headerRenderer={props => (
                        <ColumnHeader type="number" {...props} />
                    )}
                    cellRenderer={cellData}
                />
            );
        });
    }

    return null;
};

EarthEngineColumns.propTypes = {
    classes: PropTypes.bool,
    aggregationType: PropTypes.array,
    legend: PropTypes.object,
    data: PropTypes.array,
    aggregations: PropTypes.object,
};

export default EarthEngineColumns;
