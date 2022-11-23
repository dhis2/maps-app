import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadDataElementOperands } from '../../actions/dataElements.js'
import { SelectField } from '../core/index.js'

export class DataElementOperandSelect extends Component {
    static propTypes = {
        loadDataElementOperands: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        dataElement: PropTypes.object,
        dataElementGroup: PropTypes.object,
        dataElementOperands: PropTypes.object,
        errorText: PropTypes.string,
    }

    componentDidMount() {
        this.loadDataElementOperands()
    }

    componentDidUpdate() {
        this.loadDataElementOperands()
    }

    loadDataElementOperands() {
        const {
            dataElementOperands,
            dataElementGroup,
            loadDataElementOperands,
        } = this.props

        if (dataElementGroup && !dataElementOperands[dataElementGroup.id]) {
            loadDataElementOperands(dataElementGroup.id)
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
        } = this.props

        let items

        if (dataElementOperands && dataElementGroup) {
            items = dataElementOperands[dataElementGroup.id]
        } else if (dataElement) {
            items = [dataElement]
        } else {
            return null
        }

        return (
            <SelectField
                label={i18n.t('Data element operand')}
                loading={items ? false : true}
                items={items}
                value={dataElement ? dataElement.id : null}
                onChange={(dataElement) => onChange(dataElement, 'operand')}
                className={className}
                errorText={!dataElement && errorText ? errorText : null}
            />
        )
    }
}

export default connect(
    (state) => ({
        dataElementOperands: state.dataElementOperands,
    }),
    { loadDataElementOperands }
)(DataElementOperandSelect)
