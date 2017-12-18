import React, { Component } from 'react';
import i18next from 'i18next';
import { connect } from 'react-redux';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadDataElements } from '../../actions/dataElements';

export class DataElementSelect extends Component {

    componentDidUpdate() {
        const { dataElement, dataElements, dataElementGroup, loadDataElements } = this.props;

        if (dataElementGroup && !dataElements[dataElementGroup.id]) {
            loadDataElements(dataElementGroup.id);
        }
    }

    render() {
        const {
            dataElement,
            dataElements,
            dataElementGroup,
            onChange,
            style,
        } = this.props;

        if (!dataElementGroup || !dataElements[dataElementGroup.id]) {
            return null; // TODO: Add loading indicator
        }

        return (
            <SelectField
                key='indicators'
                label={i18next.t('Data element')}
                items={dataElements[dataElementGroup.id]}
                value={dataElement ? dataElement.id : null}
                onChange={onChange}
                style={style}
            />
        );
    }
}

export default connect(
    (state) => ({
        dataElements: state.dataElements,
    }),
    { loadDataElements }
)(DataElementSelect);
