import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { loadDataElements } from '../../actions/dataElements.js'
import { SelectField } from '../core/index.js'

class DataElementSelect extends PureComponent {
    static propTypes = {
        loadDataElements: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        dataElement: PropTypes.object,
        dataElementGroup: PropTypes.object,
        dataElements: PropTypes.array,
        errorText: PropTypes.string,
    }

    componentDidUpdate() {
        const { dataElements, dataElementGroup, loadDataElements } = this.props

        if (dataElementGroup && !dataElements) {
            loadDataElements(dataElementGroup.id)
        }
    }

    render() {
        const {
            dataElement,
            dataElements,
            dataElementGroup,
            onChange,
            className,
            errorText,
        } = this.props

        let items = dataElements

        if (!dataElementGroup && !dataElement) {
            return null
        } else if (!dataElements && dataElement) {
            items = [dataElement] // If favorite is loaded, we only know the used data element
        }

        return (
            <SelectField
                key="indicators"
                label={i18n.t('Data element')}
                loading={items ? false : true}
                items={items}
                value={dataElement ? dataElement.id : null}
                onChange={(dataElement) => onChange(dataElement, 'dataElement')}
                className={className}
                errorText={!dataElement && errorText ? errorText : null}
            />
        )
    }
}

export default connect(
    (state, props) => ({
        dataElements: props.dataElementGroup
            ? state.dataElements[props.dataElementGroup.id]
            : null,
    }),
    { loadDataElements }
)(DataElementSelect)
