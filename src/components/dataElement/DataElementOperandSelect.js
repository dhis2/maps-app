import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import SelectField from '../core/SelectField';
import { loadDataElementOperands } from '../../actions/dataElements';

export class DataElementOperandSelect extends Component {
    static propTypes = {
        dataElement: PropTypes.object,
        dataElementGroup: PropTypes.object,
        dataElementOperands: PropTypes.object,
        loadDataElementOperands: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        this.loadDataElementOperands();
    }

    componentDidUpdate() {
        this.loadDataElementOperands();
    }

    loadDataElementOperands() {
        const {
            dataElementOperands,
            dataElementGroup,
            loadDataElementOperands,
        } = this.props;

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

        let items;

        if (!dataElementOperands && !dataElementGroup && !dataElement) {
            return null;
        } else if (!dataElementGroup && dataElement) {
            items = [dataElement];
        } else {
            items = dataElementOperands[dataElementGroup.id];
        }

        return (
            <SelectField
                label={i18n.t('Data element operand')}
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
    state => ({
        dataElementOperands: state.dataElementOperands,
    }),
    { loadDataElementOperands }
)(DataElementOperandSelect);
