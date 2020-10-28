import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DataItemSelect from '../dataItem/DataItemSelect';
import FilterSelect from './FilterSelect';
import RemoveFilter from './RemoveFilter';
import styles from './styles/FilterRow.module.css';

class FilterRow extends Component {
    static propTypes = {
        index: PropTypes.number.isRequired,
        dataItems: PropTypes.array,
        dimension: PropTypes.string,
        filter: PropTypes.string,
        program: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        programStage: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        onRemove: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onChange(dimension, filter) {
        const { index, dataItems, onChange } = this.props;

        const name = dataItems.filter(d => d.id === dimension)[0].name;

        if (dimension !== this.props.dimension) {
            // New dimension
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
        const {
            index,
            dimension,
            filter,
            dataItems,
            program,
            programStage,
            onRemove,
        } = this.props;
        let dataItem;

        if (dataItems && dimension) {
            dataItem = dataItems.filter(d => d.id === dimension)[0];
        }

        return (
            <div className={styles.filterRow}>
                <DataItemSelect
                    value={dimension || null}
                    program={program}
                    programStage={programStage}
                    excludeTypes={[
                        'FILE_RESOURCE',
                        'ORGANISATION_UNIT',
                        'COORDINATE',
                    ]}
                    onChange={dataItem => this.onChange(dataItem.id, filter)}
                    className={styles.dataItemSelect}
                />
                {dimension ? (
                    <FilterSelect
                        {...dataItem}
                        filter={filter}
                        onChange={filter => this.onChange(dimension, filter)}
                    />
                ) : null}
                <RemoveFilter onClick={() => onRemove(index)} />
            </div>
        );
    }
}

export default FilterRow;
