import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadDataSets } from '../../actions/dataSets.js'
import { SelectField } from '../core/index.js'

class DataSetsSelect extends Component {
    static propTypes = {
        loadDataSets: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        dataSet: PropTypes.object,
        dataSets: PropTypes.array,
        errorText: PropTypes.string,
    }

    componentDidMount() {
        const { dataSets, loadDataSets } = this.props

        if (!dataSets) {
            loadDataSets()
        }
    }

    render() {
        const { dataSet, dataSets, onChange, className, errorText } = this.props
        const dataSetId = dataSet ? dataSet.id.split('.')[0] : null // Remove ".REPORTING_RATE"

        return (
            <SelectField
                label={i18n.t('Data set')}
                loading={dataSets ? false : true}
                items={dataSets}
                value={dataSetId}
                onChange={(dataSet) => onChange(dataSet, 'reportingRate')} // Reporting rates
                className={className}
                errorText={!dataSet && errorText ? errorText : null}
            />
        )
    }
}

export default connect(
    (state) => ({
        dataSets: state.dataSets,
    }),
    { loadDataSets }
)(DataSetsSelect)
