import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader } from '@dhis2/ui'
import { isValidUid } from 'd2/uid'
import { debounce } from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Column } from 'react-virtualized'
import { closeDataTable } from '../../actions/dataTable.js'
import { highlightFeature } from '../../actions/feature.js'
import { updateLayer } from '../../actions/layers.js'
import { setOrgUnitProfile } from '../../actions/orgUnits.js'
import {
    EVENT_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    EARTH_ENGINE_LAYER,
} from '../../constants/layers.js'
import { numberValueTypes } from '../../constants/valueTypes.js'
import { filterData } from '../../util/filter.js'
import { formatTime } from '../../util/helpers.js'
import ColorCell from './ColorCell.js'
import ColumnHeader from './ColumnHeader.js'
import EarthEngineColumns from './EarthEngineColumns.js'
import styles from './styles/DataTable.module.css'
import 'react-virtualized/styles.css'

// Using react component to keep sorting state, which is only used within the data table.
class DataTable extends Component {
    static propTypes = {
        closeDataTable: PropTypes.func.isRequired,
        height: PropTypes.number.isRequired,
        highlightFeature: PropTypes.func.isRequired,
        layer: PropTypes.object.isRequired,
        setOrgUnitProfile: PropTypes.func.isRequired,
        updateLayer: PropTypes.func.isRequired,
        width: PropTypes.number.isRequired,
        aggregations: PropTypes.object,
        feature: PropTypes.object,
    }

    static defaultProps = {
        data: [],
    }

    state = {}

    constructor(props, context) {
        super(props, context)

        // Default sort
        const sortBy = 'index'
        const sortDirection = 'ASC'

        const data = this.sort(this.filter(), sortBy, sortDirection)

        this.state = {
            sortBy,
            sortDirection,
            data,
        }
    }

    componentDidMount() {
        this.loadExtendedData()
    }

    componentDidUpdate(prevProps) {
        const { layer, aggregations, closeDataTable } = this.props
        const { data, dataFilters } = layer
        const prev = prevProps.layer

        if (!data) {
            closeDataTable()
        } else if (
            data !== prev.data ||
            dataFilters !== prev.dataFilters ||
            aggregations !== prevProps.aggregations
        ) {
            const { sortBy, sortDirection } = this.state

            this.setState({
                data: this.sort(this.filter(), sortBy, sortDirection),
            })
        }
    }

    loadExtendedData() {
        const { layer, updateLayer } = this.props
        const { isExtended, serverCluster } = layer
        const layerType = layer.layerType || layer.layer

        if (layerType === EVENT_LAYER && !isExtended && !serverCluster) {
            updateLayer({
                ...layer,
                showDataTable: true,
            })
        }
    }

    filter() {
        const { layer, aggregations = {} } = this.props
        const { dataFilters } = layer
        const data = layer.data.filter(
            (d) => !d.properties.hasAdditionalGeometry
        )

        return filterData(
            data.map((d, index) => ({
                ...(d.properties || d),
                ...aggregations[d.id],
                index,
            })),
            dataFilters
        )
    }

    // TODO: Make sure sorting works across different locales - use lib method
    sort(data, sortBy, sortDirection) {
        return data.sort((a, b) => {
            a = a[sortBy]
            b = b[sortBy]

            if (typeof a === 'number') {
                return sortDirection === 'ASC' ? a - b : b - a
            }

            // Some values are null
            if (
                a !== undefined &&
                a !== null &&
                b !== undefined &&
                b !== null
            ) {
                return sortDirection === 'ASC'
                    ? a.localeCompare(b)
                    : b.localeCompare(a)
            }

            return 0
        })
    }

    onSort(sortBy, sortDirection) {
        const { data } = this.state

        this.setState({
            sortBy,
            sortDirection,
            data: this.sort(data, sortBy, sortDirection),
        })
    }

    // Return event data items used for styling, filters or "display in reports"
    getEventDataItems() {
        const { headers = [] } = this.props.layer

        return headers
            .filter(({ name }) => isValidUid(name))
            .map(({ name, column, valueType }) => ({
                key: name,
                label: column,
                type: numberValueTypes.includes(valueType)
                    ? 'number'
                    : 'string',
            }))
    }

    // Debounce needed as event is triggered multiple times for the same row
    highlightFeature = debounce(50, (id) => {
        const { feature, layer } = this.props

        // If not the same feature as already highlighted
        if (!id || !feature || id !== feature.id) {
            this.props.highlightFeature(
                id
                    ? {
                          id,
                          layerId: layer.id,
                          origin: 'table',
                      }
                    : null
            )
        }
    })

    onRowClick = (evt) => this.props.setOrgUnitProfile(evt.rowData.id)
    onRowMouseOver = (evt) => this.highlightFeature(evt.rowData.id)
    onRowMouseOut = () => this.highlightFeature()

    render() {
        const { data, sortBy, sortDirection } = this.state
        const { width, height, layer, aggregations } = this.props

        const { styleDataItem, serverCluster, aggregationType, legend } = layer
        const layerType = layer.layerType || layer.layer
        const isThematic = layerType === THEMATIC_LAYER
        const isOrgUnit = layerType === ORG_UNIT_LAYER
        const isEvent = layerType === EVENT_LAYER
        const isEarthEngine = layerType === EARTH_ENGINE_LAYER
        const isLoading =
            isEarthEngine && aggregationType?.length && !aggregations

        return !serverCluster ? (
            <>
                <Table
                    className={styles.dataTable}
                    width={width}
                    height={height}
                    headerHeight={48}
                    rowHeight={32}
                    rowCount={data.length}
                    rowGetter={({ index }) => data[index]}
                    sort={({ sortBy, sortDirection }) =>
                        this.onSort(sortBy, sortDirection)
                    }
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    useDynamicRowHeight={false}
                    hideIndexRow={false}
                    onRowClick={!isEvent ? this.onRowClick : undefined}
                    onRowMouseOver={this.onRowMouseOver}
                    onRowMouseOut={this.onRowMouseOut}
                >
                    <Column
                        cellDataGetter={({ rowData }) => rowData.index}
                        dataKey="index"
                        label={i18n.t('Index')}
                        width={72}
                        className="right"
                    />
                    <Column
                        dataKey={isEvent ? 'ouname' : 'name'}
                        label={isEvent ? i18n.t('Org unit') : i18n.t('Name')}
                        width={100}
                        headerRenderer={(props) => (
                            <ColumnHeader type="string" {...props} />
                        )}
                    />
                    <Column
                        dataKey="id"
                        label={i18n.t('Id')}
                        width={100}
                        headerRenderer={(props) => (
                            <ColumnHeader type="string" {...props} />
                        )}
                    />
                    {isEvent && (
                        <Column
                            dataKey="eventdate"
                            label={i18n.t('Event time')}
                            width={100}
                            headerRenderer={(props) => (
                                <ColumnHeader type="date" {...props} />
                            )}
                            cellRenderer={({ cellData }) =>
                                cellData ? formatTime(cellData) : ''
                            }
                        />
                    )}
                    {isEvent &&
                        this.getEventDataItems().map(({ key, label, type }) => (
                            <Column
                                key={key}
                                dataKey={key}
                                label={label}
                                width={100}
                                className={type === 'number' ? 'right' : 'left'}
                                headerRenderer={(props) => (
                                    <ColumnHeader type={type} {...props} />
                                )}
                            />
                        ))}
                    {isThematic && (
                        <Column
                            dataKey="value"
                            label={i18n.t('Value')}
                            width={72}
                            className="right"
                            headerRenderer={(props) => (
                                <ColumnHeader type="number" {...props} />
                            )}
                        />
                    )}
                    {isThematic && (
                        <Column
                            dataKey="legend"
                            label={i18n.t('Legend')}
                            width={100}
                            headerRenderer={(props) => (
                                <ColumnHeader type="string" {...props} />
                            )}
                        />
                    )}
                    {isThematic && (
                        <Column
                            dataKey="range"
                            label={i18n.t('Range')}
                            width={72}
                            headerRenderer={(props) => (
                                <ColumnHeader type="string" {...props} />
                            )}
                        />
                    )}
                    {(isThematic || isOrgUnit) && (
                        <Column
                            dataKey="level"
                            label={i18n.t('Level')}
                            width={72}
                            className="right"
                            headerRenderer={(props) => (
                                <ColumnHeader type="number" {...props} />
                            )}
                        />
                    )}
                    {(isThematic || isOrgUnit) && (
                        <Column
                            dataKey="parentName"
                            label={i18n.t('Parent')}
                            width={100}
                            headerRenderer={(props) => (
                                <ColumnHeader type="string" {...props} />
                            )}
                        />
                    )}
                    <Column
                        dataKey="type"
                        label={i18n.t('Type')}
                        width={100}
                        headerRenderer={(props) => (
                            <ColumnHeader type="string" {...props} />
                        )}
                    />
                    {(isThematic || styleDataItem) && (
                        <Column
                            dataKey="color"
                            label={i18n.t('Color')}
                            width={100}
                            headerRenderer={(props) => (
                                <ColumnHeader type="string" {...props} />
                            )}
                            cellRenderer={ColorCell}
                        />
                    )}

                    {isEarthEngine &&
                        EarthEngineColumns({ aggregationType, legend, data })}
                </Table>
                {isLoading === true && (
                    <div className={styles.loader}>
                        <CenteredContent>
                            <CircularLoader />
                        </CenteredContent>
                    </div>
                )}
            </>
        ) : (
            <div className={styles.noSupport}>
                {i18n.t(
                    'Data table is not supported when events are grouped on the server.'
                )}
            </div>
        )
    }
}

export default connect(
    ({ dataTable, map, aggregations = {}, feature }) => {
        const layer = map.mapViews.find((l) => l.id === dataTable)

        return layer
            ? {
                  layer,
                  feature,
                  aggregations: aggregations[layer.id],
              }
            : {}
    },
    {
        closeDataTable,
        updateLayer,
        setOrgUnitProfile,
        highlightFeature,
    }
)(DataTable)
