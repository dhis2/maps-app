import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { loadDataSets } from '../../actions/dataSets';

export class DataElementGroupSelect extends Component {
    static propTypes = {
        dataSet: PropTypes.object,
        dataSets: PropTypes.array,
        loadDataSets: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        errorText: PropTypes.string,
    };

    componentDidMount() {
        const { dataSets, loadDataSets } = this.props;

        if (!dataSets) {
            loadDataSets();
        }
    }

    render() {
        const {
            dataSet,
            dataSets,
            onChange,
            className,
            errorText,
        } = this.props;
        const dataSetId = dataSet ? dataSet.id.split('.')[0] : null; // Remove ".REPORTING_RATE"

        return (
            <SelectField
                label={i18n.t('Data set')}
                loading={dataSets ? false : true}
                items={dataSets}
                value={dataSetId}
                onChange={dataSet => onChange(dataSet, 'reportingRate')} // Reporting rates
                className={className}
                errorText={!dataSet && errorText ? errorText : null}
            />
        );
    }
}

export default connect(
    state => ({
        dataSets: state.dataSets,
    }),
    { loadDataSets }
)(DataElementGroupSelect);
