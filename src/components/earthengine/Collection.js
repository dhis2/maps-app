import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadEarthEngineCollection } from '../../actions/earthEngine';

const collectionFilters = {
    'WorldPop/POP': year => [
        {
            type: 'eq',
            arguments: ['year', year],
        },
        {
            type: 'eq',
            arguments: ['UNadj', 'yes'],
        },
    ],
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
        const {
            id,
            filter,
            label,
            collections,
            onChange,
            style,
            errorText,
        } = this.props;
        const items = collections[id];
        const value = filter && filter[0].arguments[1];

        const collectionFilter =
            collectionFilters[id] ||
            (index => [
                {
                    type: 'eq',
                    arguments: ['system:index', index],
                },
            ]);

        return (
            <SelectField
                label={label || i18next.t('Period')}
                loading={items ? false : true}
                items={items}
                value={value}
                onChange={period => onChange(collectionFilter(period.id))}
                style={style}
                errorText={!value && errorText ? errorText : null}
            />
        );
    }
}

export default connect(
    state => ({
        collections: state.earthEngine,
    }),
    { loadEarthEngineCollection }
)(CollectionSelect);
