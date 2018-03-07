import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, Column } from 'react-virtualized';
import mapValues from 'lodash/fp/mapValues';
import ColumnHeader from './ColumnHeader';
import ColorCell from './ColorCell';
import { selectOrgUnit, unselectOrgUnit } from '../../actions/orgUnits';
import { setDataFilter, clearDataFilter } from '../../actions/dataFilters';
import { filterData } from '../../util/filter';
import './DataTable.css';

// Using react component to keep sorting state, which is only used within the data table.
class DataTable extends Component {
    static propTypes = {
        data: PropTypes.array.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
    };

    static defaultProps = {
        data: [],
    };

    constructor(props, context) {
        super(props, context);

        // Default sort
        const sortBy = 'index';
        const sortDirection = 'ASC';

        this.state = {
            sortBy: sortBy,
            sortDirection: sortDirection,
            data: this.sort(props.data, sortBy, sortDirection),
        };
    }

    onSort(sortBy, sortDirection) {
        const data = this.state.data;

        this.setState({
            sortBy,
            sortDirection,
            data: this.sort(data, sortBy, sortDirection),
        });
    }

    // TODO: Make sure sorting works across different locales - use lib method
    sort(data, sortBy, sortDirection) {
        return data.sort((a, b) => {
            a = a[sortBy];
            b = b[sortBy];

            if (typeof a === 'number') {
                return sortDirection === 'ASC' ? a - b : b - a;
            }

            if (a !== undefined) {
                return sortDirection === 'ASC'
                    ? a.localeCompare(b)
                    : b.localeCompare(a);
            }

            return 0;
        });
    }

    render() {
        const { width, height, data, layerType } = this.props;
        const fields = mapValues(() => true, data[0]);
        const { sortBy, sortDirection } = this.state;
        const sortedData = this.sort(data, sortBy, sortDirection);
        const isFacility = layerType === 'facility';
        const isThematic = layerType === 'thematic';
        const isBoundary = layerType === 'boundary';

        return (
            <Table
                className="DataTable"
                width={width}
                height={height}
                headerHeight={48}
                rowHeight={32}
                rowCount={sortedData.length}
                rowGetter={({ index }) => sortedData[index]}
                sort={({ sortBy, sortDirection }) =>
                    this.onSort(sortBy, sortDirection)
                }
                sortBy={sortBy}
                sortDirection={sortDirection}
                useDynamicRowHeight={false}
                hideIndexRow={false}
            >
                <Column
                    cellDataGetter={({ columnData, dataKey, rowData }) =>
                        rowData.index
                    }
                    dataKey="index"
                    label="Index"
                    width={72}
                    className="right"
                    // headerRenderer={props => <ColumnHeader type='number' {...props}  />}
                />
                <Column
                    dataKey="name"
                    label="Name"
                    width={100}
                    headerRenderer={props => (
                        <ColumnHeader type="string" {...props} />
                    )}
                />
                {isThematic && (
                    <Column
                        dataKey="value"
                        label="Value"
                        width={72}
                        className="right"
                        headerRenderer={props => (
                            <ColumnHeader type="number" {...props} />
                        )}
                    />
                )}
                {isThematic && (
                    <Column
                        dataKey="legend"
                        label="Legend"
                        width={100}
                        headerRenderer={props => (
                            <ColumnHeader type="string" {...props} />
                        )}
                    />
                )}
                {isThematic && (
                    <Column
                        dataKey="range"
                        label="Range"
                        width={72}
                        headerRenderer={props => (
                            <ColumnHeader type="string" {...props} />
                        )}
                    />
                )}
                {(isThematic || isBoundary) && (
                    <Column
                        dataKey="level"
                        label="Level"
                        width={72}
                        className="right"
                        headerRenderer={props => (
                            <ColumnHeader type="number" {...props} />
                        )}
                    />
                )}
                {(isThematic || isBoundary) && (
                    <Column
                        dataKey="parentName"
                        label="Parent"
                        width={100}
                        headerRenderer={props => (
                            <ColumnHeader type="string" {...props} />
                        )}
                    />
                )}
                <Column
                    dataKey="id"
                    label="ID"
                    width={100}
                    headerRenderer={props => (
                        <ColumnHeader type="string" {...props} />
                    )}
                />
                <Column
                    dataKey="type"
                    label="Type"
                    width={100}
                    headerRenderer={props => (
                        <ColumnHeader type="string" {...props} />
                    )}
                />
                {isThematic && (
                    <Column
                        dataKey="color"
                        label="Color"
                        width={100}
                        headerRenderer={props => (
                            <ColumnHeader type="string" {...props} />
                        )}
                        cellRenderer={ColorCell}
                    />
                )}
            </Table>
        );
    }
}

const mapStateToProps = state => {
    const overlay = state.dataTable
        ? state.map.mapViews.filter(layer => layer.id === state.dataTable)[0]
        : null;

    if (overlay) {
        const data = filterData(
            overlay.data.map((d, i) => ({
                ...d.properties,
                index: i,
            })),
            overlay.dataFilters
        );

        return {
            layerType: overlay.layer,
            data,
        };
    }

    return null;
};

export default connect(mapStateToProps, {
    selectOrgUnit,
    unselectOrgUnit,
    setDataFilter,
    clearDataFilter,
})(DataTable);
