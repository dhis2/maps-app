import React from 'react';
import PropTypes from 'prop-types';
import { Column } from 'react-virtualized';
import ColumnHeader from './ColumnHeader';
import { numberPrecision } from '../../util/numbers';
import { getPropName, getPrecision } from '../../util/earthEngine';

const EarthEngineColumns = ({ classes, aggregationType, legend, data }) => {
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
            const propName = getPropName(type, title);
            const precision = getPrecision(data.map(d => d[propName]));
            const valueFormat = numberPrecision(precision);

            return (
                <Column
                    key={type}
                    dataKey={propName}
                    label={`${type} ${title}`}
                    width={100}
                    className="right"
                    headerRenderer={props => (
                        <ColumnHeader type="number" {...props} />
                    )}
                    cellRenderer={d =>
                        d.cellData !== undefined ? valueFormat(d.cellData) : ''
                    }
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
};

export default EarthEngineColumns;
