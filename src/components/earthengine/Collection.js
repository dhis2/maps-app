import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadEarthEngineCollection } from '../../actions/earthEngine';

const collectionFilters = {
    'WorldPop/POP': (year) => [{
        type: 'eq',
        arguments: ['year', year],
    }, {
        type: 'eq',
        arguments: ['UNadj', 'yes'],
    }],
};

export class CollectionSelect extends Component {

    static propTypes = {
        collections: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        const { id, collections, loadEarthEngineCollection } = this.props;

        if (id && !collections[id]) {
            loadEarthEngineCollection(id);
        }
    }

    render() {
        const { id, filter, label, collections, onChange, style } = this.props;

        if (!collections[id]) {
            return null;
        }

        const collectionFilter = collectionFilters[id] || ((index) => [{
            type: 'eq',
            arguments: ['system:index', index],
        }]);

        return (
            <SelectField
                label={label || i18next.t('Period')}
                items={collections[id]}
                value={filter && filter[0].arguments[1]}
                onChange={period => onChange(collectionFilter(period.id))}
                style={style}
            />
        );
    }
}

export default connect(
    (state) => ({
        collections: state.earthEngine,
    }),
    { loadEarthEngineCollection }
)(CollectionSelect);
