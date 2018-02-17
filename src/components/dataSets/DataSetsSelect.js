import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadDataSets } from '../../actions/dataSets';

export class DataElementGroupSelect extends Component {

    static propTypes = {
        dataSet: PropTypes.object,
        dataSets: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        const { dataSets, loadDataSets } = this.props;

        if (!dataSets) {
            loadDataSets();
        }
    }

    render() {
        const { dataSet, dataSets, onChange, style } = this.props;

        return (
            <SelectField
                label={i18next.t('Data set')}
                loading={dataSets ? false : true}
                items={dataSets}
                value={dataSet ? dataSet.id : null}
                onChange={dataSet => onChange(dataSet, 'dataSet')}
                style={style}
            />
        );
    }
}

export default connect(
    (state) => ({
        dataSets: state.dataSets,
    }),
    { loadDataSets }
)(DataElementGroupSelect);
