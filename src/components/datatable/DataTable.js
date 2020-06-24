import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Table, Column } from 'react-virtualized';
import ColumnHeader from './ColumnHeader';
import ColorCell from './ColorCell';
import { selectOrgUnit, unselectOrgUnit } from '../../actions/orgUnits';
import { setDataFilter, clearDataFilter } from '../../actions/dataFilters';
import { loadLayer } from '../../actions/layers';
import { filterData } from '../../util/filter';
import './DataTable.css';

// Using react component to keep sorting state, which is only used within the data table.
class DataTable extends Component {
    static propTypes = {
        layer: PropTypes.object.isRequired,
        // layerType: PropTypes.string.isRequired,
        // data: PropTypes.array.isRequired,
        // isExtended: PropTypes.bool.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        loadLayer: PropTypes.func.isRequired,
    };

    static defaultProps = {
        data: [],
    };

    constructor(props, context) {
        super(props, context);

        // Default sort
        const sortBy = 'index';
        const sortDirection = 'ASC';

        const data = this.sort(this.filter(), sortBy, sortDirection);

        this.state = {
            sortBy,
            sortDirection,
            data,
        };
    }

    componentDidMount() {
        this.loadExtendedData();
    }

    componentDidUpdate(prevProps) {
        if (this.props.layer.dataFilters !== prevProps.layer.dataFilters) {
            const { sortBy, sortDirection } = this.state;

            this.setState({
                data: this.sort(this.filter(), sortBy, sortDirection),
            });
        }
    }

    loadExtendedData() {
        const { layer, loadLayer } = this.props;

        if (!layer.isExtended) {
            loadLayer({
                ...layer,
                showDataTable: true,
            });
        }
    }

    filter() {
        const { data, dataFilters } = this.props.layer;

        return filterData(
            data.map((d, i) => ({
                ...d.properties,
                index: i,
            })),
            dataFilters
        );
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

    onSort(sortBy, sortDirection) {
        const data = this.state.data;

        this.setState({
            sortBy,
            sortDirection,
            data: this.sort(data, sortBy, sortDirection),
        });
    }

    render() {
        const { width, height, layer } = this.props;
        const { layer: layerType } = layer;
        // const fields = mapValues(() => true, data[0]);
        const { data, sortBy, sortDirection } = this.state;
        // const sortedData = this.sort(data, sortBy, sortDirection);
        const isThematic = layerType === 'thematic';
        const isBoundary = layerType === 'boundary';
        const isEvent = layerType === 'event';

        return (
            <Table
                className="DataTable"
                width={width}
                height={height}
                headerHeight={48}
                rowHeight={32}
                // rowCount={sortedData.length}
                // rowGetter={({ index }) => sortedData[index]}
                rowCount={data.length}
                rowGetter={({ index }) => data[index]}
                sort={({ sortBy, sortDirection }) =>
                    this.onSort(sortBy, sortDirection)
                }
                sortBy={sortBy}
                sortDirection={sortDirection}
                useDynamicRowHeight={false}
                hideIndexRow={false}
            >
                <Column
                    cellDataGetter={({ rowData }) => rowData.index}
                    dataKey="index"
                    label={i18n.t('Index')}
                    width={72}
                    className="right"
                    // headerRenderer={props => <ColumnHeader type='number' {...props}  />}
                />
                {!isEvent && (
                    <Column
                        dataKey="name"
                        label={i18n.t('Name')}
                        width={100}
                        headerRenderer={props => (
                            <ColumnHeader type="string" {...props} />
                        )}
                    />
                )}
                {isThematic && (
                    <Column
                        dataKey="value"
                        label={i18n.t('Value')}
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
                        label={i18n.t('Legend')}
                        width={100}
                        headerRenderer={props => (
                            <ColumnHeader type="string" {...props} />
                        )}
                    />
                )}
                {isThematic && (
                    <Column
                        dataKey="range"
                        label={i18n.t('Range')}
                        width={72}
                        headerRenderer={props => (
                            <ColumnHeader type="string" {...props} />
                        )}
                    />
                )}
                {(isThematic || isBoundary) && (
                    <Column
                        dataKey="level"
                        label={i18n.t('Level')}
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
                        label={i18n.t('Parent')}
                        width={100}
                        headerRenderer={props => (
                            <ColumnHeader type="string" {...props} />
                        )}
                    />
                )}
                <Column
                    dataKey="id"
                    label={i18n.t('Id')}
                    width={100}
                    headerRenderer={props => (
                        <ColumnHeader type="string" {...props} />
                    )}
                />
                <Column
                    dataKey="type"
                    label={i18n.t('Type')}
                    width={100}
                    headerRenderer={props => (
                        <ColumnHeader type="string" {...props} />
                    )}
                />
                {isThematic && (
                    <Column
                        dataKey="color"
                        label={i18n.t('Color')}
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
/*
const mapStateToProps = state => {
    const overlay = state.dataTable
        ? state.map.mapViews.filter(layer => layer.id === state.dataTable)[0]
        : null;

    if (overlay) {
        const { data, dataFilters, layer, isExtended } = overlay;

        const filteredData = filterData(
            data.map((d, i) => ({
                ...d.properties,
                index: i,
            })),
            dataFilters
        );

        return {
            layerType: layer,
            data: filteredData,
            isExtended: layer !== 'event' || isExtended,
        };
    }

    return null;
};
*/

export default connect(
    ({ dataTable, map }) => {
        const layer = dataTable
            ? map.mapViews.filter(l => l.id === dataTable)[0]
            : null;

        return layer ? { layer } : null;
    },
    {
        selectOrgUnit,
        unselectOrgUnit,
        setDataFilter,
        clearDataFilter,
        loadLayer,
    }
)(DataTable);
