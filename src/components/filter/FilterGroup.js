import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import Button from '@material-ui/core/Button';
import FilterRow from './FilterRow';
import { combineDataItems } from '../../util/analytics';
import { addFilter, removeFilter, changeFilter } from '../../actions/layerEdit';

const styles = {
    container: {
        width: '100%',
        height: 300,
        paddingTop: 16,
        overflowY: 'auto',
    },
    button: {
        marginTop: 8,
    },
    note: {
        paddingTop: 16,
    },
};

class FilterGroup extends Component {
    static propTypes = {
        filters: PropTypes.array,
        dataItems: PropTypes.array,
        program: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        programStage: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        addFilter: PropTypes.func.isRequired,
        removeFilter: PropTypes.func.isRequired,
        changeFilter: PropTypes.func.isRequired,
    };

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
                    {i18n.t(
                        'Filtering is available after selecting a program stage.'
                    )}
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
                    variant="contained"
                    color="primary"
                    onClick={() => addFilter()}
                    style={styles.button}
                >
                    {i18n.t('Add filter')}
                </Button>
            </div>
        );
    }
}

export default connect(
    (state, { program, programStage }) => ({
        dataItems:
            program && programStage
                ? combineDataItems(
                      state.programTrackedEntityAttributes[program.id],
                      state.programStageDataElements[programStage.id],
                      null,
                      ['FILE_RESOURCE', 'ORGANISATION_UNIT', 'COORDINATE'] // Exclude these value types
                  )
                : [],
    }),
    { addFilter, removeFilter, changeFilter }
)(FilterGroup);
