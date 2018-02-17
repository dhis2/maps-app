import React, { Component } from 'react';
import i18next from 'i18next';
import { connect } from 'react-redux';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadDataElementOperands } from '../../actions/dataElements';

export class DataElementOperandSelect extends Component {

    componentDidMount() {
        this.loadDataElementOperands();
    }

    componentDidUpdate() {
        this.loadDataElementOperands();
    }

    loadDataElementOperands() {
        const { dataElementOperands, dataElementGroup, loadDataElementOperands } = this.props;

        if (dataElementGroup && !dataElementOperands[dataElementGroup.id]) {
            loadDataElementOperands(dataElementGroup.id);
        }
    }

    render() {
        const {
            dataElement,
            dataElementOperands,
            dataElementGroup,
            onChange,
            style,
        } = this.props;

        if (!dataElementGroup) {
            return null;
        }

        const items = dataElementOperands[dataElementGroup.id];

        return (
            <SelectField
                label={i18next.t('Data element operand')}
                loading={items ? false : true}
                items={items}
                value={dataElement ? dataElement.id : null}
                onChange={dataElement => onChange(dataElement, 'operand')}
                style={style}
            />
        );
    }
}

export default connect(
    (state) => ({
        dataElementOperands: state.dataElementOperands,
    }),
    { loadDataElementOperands }
)(DataElementOperandSelect);
