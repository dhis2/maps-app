import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import { loadDimensionItems } from '../../actions/dimensions';

const styles = {
    select: {
        width: '60%',
    },
};

export class DimensionItemsSelect extends Component {
    static propTypes = {
        dimension: PropTypes.string,
        items: PropTypes.array,
        value: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        loadDimensionItems: PropTypes.func.isRequired,
        style: PropTypes.object,
        errorText: PropTypes.string,
    };

    componentDidUpdate() {
        const { dimension, items, loadDimensionItems } = this.props;

        if (dimension && !items) {
            loadDimensionItems(dimension);
        }
    }

    onDimensionItemClick = ids => {
        const { items, onChange } = this.props;

        onChange(ids.map(id => items.find(item => item.id === id)));
    };

    render() {
        const { items, value } = this.props;

        if (!items) {
            return null;
        }

        return (
            <SelectField
                label={i18n.t('Items')}
                items={items}
                value={value}
                multiple={true}
                onChange={this.onDimensionItemClick}
                style={styles.select}
            />
        );
    }
}

export default connect(
    ({ dimensions }, { dimension }) => ({
        items:
            dimensions && dimension
                ? dimensions.find(dim => dim.id === dimension).items
                : null,
    }),
    { loadDimensionItems }
)(DimensionItemsSelect);
