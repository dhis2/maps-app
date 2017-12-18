import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import sortBy from 'lodash/fp/sortBy';
import Button from 'd2-ui/lib/button/Button';
import FilterRow from './FilterRow';
import { combineDataItems } from '../../util/analytics';
import { addFilter, removeFilter, changeFilter } from '../../actions/layerEdit';

const styles = {
    container: {
        width: '100%',
        padding: 12,
    },
    button: {
        marginTop: 8,
    },
    note: {
        padding: 12,
    },
};

class FilterGroup extends Component {

    render() {
        const {
            filters = [],
            dataItems,
            program,
            programStage,
            addFilter,
            removeFilter,
            changeFilter,
        } = this.props;

        if (!programStage) {
            return (
                <div style={styles.note}>
                    {i18next.t('Filtering is available after selecting a program stage.')}
                </div>
            );
        }

        return (
            <div style={styles.container}>
                {filters.map((item, index) => (
                    <FilterRow
                        key={index}
                        index={index}
                        dataItems={dataItems}
                        program={program}
                        programStage={programStage}
                        onChange={changeFilter}
                        onRemove={removeFilter}
                        {...item}
                    />
                ))}
                <Button
                    raised color='accent'
                    onClick={() => addFilter()}
                    style={styles.button}
                >{i18next.t('Add filter')}</Button>
            </div>
        );
    }
}

export default connect(
    (state, { program, programStage }) => ({
        dataItems: (program && programStage) ? combineDataItems(
            state.programTrackedEntityAttributes[program.id],
            state.programStageDataElements[programStage.id],
            ['FILE_RESOURCE', 'ORGANISATION_UNIT', 'COORDINATE'], // Exclude these value types
        ) : [],
    }),
    { addFilter, removeFilter, changeFilter }
)(FilterGroup);



