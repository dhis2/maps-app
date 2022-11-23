import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadDataElementGroups } from '../../actions/dataElements.js'
import { SelectField } from '../core/index.js'

export class DataElementGroupSelect extends Component {
    static propTypes = {
        loadDataElementGroups: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        dataElementGroup: PropTypes.object,
        dataElementGroups: PropTypes.array,
        errorText: PropTypes.string,
    }

    componentDidMount() {
        const { dataElementGroups, loadDataElementGroups } = this.props

        if (!dataElementGroups) {
            loadDataElementGroups()
        }
    }

    render() {
        const {
            dataElementGroup,
            dataElementGroups,
            onChange,
            className,
            errorText,
        } = this.props

        return (
            <SelectField
                label={i18n.t('Data element group')}
                loading={dataElementGroups ? false : true}
                items={dataElementGroups}
                value={dataElementGroup ? dataElementGroup.id : null}
                onChange={onChange}
                className={className}
                errorText={!dataElementGroup && errorText ? errorText : null}
            />
        )
    }
}

export default connect(
    (state) => ({
        dataElementGroups: state.dataElementGroups,
    }),
    { loadDataElementGroups }
)(DataElementGroupSelect)
