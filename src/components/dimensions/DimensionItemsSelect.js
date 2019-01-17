import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import i18n from '@dhis2/d2-i18n';
// import SelectField from '../core/SelectField';
import { loadDimensionItems } from '../../actions/dimensions';

export class DimensionItemsSelect extends Component {
    static propTypes = {
        dimension: PropTypes.string,
        items: PropTypes.array,
        // onChange: PropTypes.func.isRequired,
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

    render() {
        // console.log(this.props.items);
        return <span>###</span>;
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
