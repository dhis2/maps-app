import React, { Component } from 'react';
import i18next from 'i18next';
import { connect } from 'react-redux';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadDataElements } from '../../actions/dataElements';

export class DataElementSelect extends Component {
    componentDidUpdate() {
        const { dataElements, dataElementGroup, loadDataElements } = this.props;

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

        if (!dataElementGroup) {
            return null;
        }

        const items = dataElements[dataElementGroup.id];

        return (
            <SelectField
                key="indicators"
                label={i18next.t('Data element')}
                loading={items ? false : true}
                items={items}
                value={dataElement ? dataElement.id : null}
                onChange={dataElement => onChange(dataElement, 'dataElement')}
                style={style}
            />
        );
    }
}

export default connect(
    state => ({
        dataElements: state.dataElements,
    }),
    { loadDataElements }
)(DataElementSelect);
