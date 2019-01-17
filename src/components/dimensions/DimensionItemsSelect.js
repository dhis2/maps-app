import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import { loadDimensions } from '../../actions/dimensions';

export class DimensionItemsSelect extends Component {
    /*
    static propTypes = {
        dimension: PropTypes.object,
        dimensions: PropTypes.array,
        // onChange: PropTypes.func.isRequired,
        loadDimensions: PropTypes.func.isRequired,
        style: PropTypes.object,
        errorText: PropTypes.string,
    };
    */

    /*
    componentDidMount() {
        const { dimensions, loadDimensions } = this.props;

        if (!dimensions) {
            loadDimensions();
        }
    }
    */

    /*
    render() {
        const { dimensions } = this.props;

        return (
            <SelectField
                label={i18n.t('Dimension')}
                loading={dimensions ? false : true}
                items={dimensions}
                // value={value}
                onChange={this.onChange}
                //style={style}
                //errorText={!program && errorText ? errorText : null}
                data-test="dimensionselect"
            />
        );
    }
    */

    render() {
        return <span>###</span>;
    }

    /*
    onChange = dimension => {
        console.log('onChange', dimension);
    };
    */
}

export default connect(
    state => ({
        // dimensions: state.dimensions,
    }),
    { loadDimensions }
)(DimensionItemsSelect);
