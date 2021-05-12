import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { SelectField } from '../core';
import { loadDataElementOperands } from '../../actions/dataElements';

export class DataElementOperandSelect extends Component {
    static propTypes = {
        dataElement: PropTypes.object,
        dataElementGroup: PropTypes.object,
        dataElementOperands: PropTypes.object,
        loadDataElementOperands: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        errorText: PropTypes.string,
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
            className,
            errorText,
        } = this.props;

        let items;

        if (dataElementOperands && dataElementGroup) {
            items = dataElementOperands[dataElementGroup.id];
        } else if (dataElement) {
            items = [dataElement];
        } else {
            return null;
        }

        return (
            <SelectField
                label={i18n.t('Data element operand')}
                loading={items ? false : true}
                items={items}
                value={dataElement ? dataElement.id : null}
                onChange={dataElement => onChange(dataElement, 'operand')}
                className={className}
                errorText={!dataElement && errorText ? errorText : null}
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
