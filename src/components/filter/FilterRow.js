import React, { Component } from 'react';
import DataItemSelect from '../dataItem/DataItemSelect';
import FilterSelect from './FilterSelect';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';

// https://react.rocks/example/react-redux-test

const styles = {
    container: {
        height: 64,
        marginBottom: 8,
        padding: '0 56px 0 8px',
        background: '#f4f4f4',
        position: 'relative',
        clear: 'both',
    },
    select: {
        top: -8,
        marginRight: 24,
        float: 'left',
        width: 'calc((100% - 48px) / 8 * 3)',
    },
    removeBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
    }
};

class FilterRow extends Component {

    onChange(dimension, filter) {
        const { index, dataItems, onChange } = this.props;
        const name = dataItems.filter(d => d.id === dimension)[0].name;

        if (dimension !== this.props.dimension) { // New dimension
            onChange(index, {
                dimension,
                name,
                filter: null,
            });
        } else {
            onChange(index, {
                dimension,
                name,
                filter,
            });
        }
    }

    render() {
        const { index, dimension, filter, dataItems, program, programStage, onRemove } = this.props;
        let dataItem;

        if (dataItems && dimension) {
            dataItem = dataItems.filter(d => d.id === dimension)[0];
        }

        return (
            <div style={styles.container}>
                <DataItemSelect
                    items={dataItems}
                    value={dimension || null}
                    program={program}
                    programStage={programStage}
                    onChange={dataItem => this.onChange(dataItem.id, filter)}
                    style={styles.select}
                />
                {dimension ?
                    <FilterSelect
                        {...dataItem}
                        filter={filter}
                        onChange={filter => this.onChange(dimension, filter)}
                    />
                : null}
                <IconButton
                    tooltip="Remove filter"
                    style={styles.removeBtn}
                    onClick={() => onRemove(index)}
                >
                    <SvgIcon icon='Close' />
                </IconButton>
            </div>
        )
    }
}

export default FilterRow;
