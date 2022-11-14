import React from 'react';
import PropTypes from 'prop-types';
import { Column } from 'react-virtualized';
import ColumnHeader from './ColumnHeader';
import { numberPrecision } from '../../util/numbers';
import { getPrecision } from '../../util/earthEngine';

const FeatureServiceColumns = ({ fields, data }) => {
    // console.log('FeatureServiceColumns', fields, data);

    if (!fields || !data) {
        return null;
    }

    // TODO: Remove slice
    return fields.slice(0, 10).map(({ name, type }) => {
        const isString = type.includes('String');
        const precision = getPrecision(data.map(d => d[name]));
        const valueFormat = numberPrecision(precision);

        return (
            <Column
                key={name}
                dataKey={name}
                label={name}
                width={100}
                className="right"
                headerRenderer={props => (
                    <ColumnHeader
                        type={isString ? 'string' : 'number'}
                        {...props}
                    />
                )}
                cellRenderer={
                    !isString
                        ? d =>
                              d.cellData !== undefined
                                  ? valueFormat(d.cellData)
                                  : ''
                        : undefined
                }
            />
        );
    });
};

FeatureServiceColumns.propTypes = {
    fields: PropTypes.array,
    data: PropTypes.array,
};

export default FeatureServiceColumns;
