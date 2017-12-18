import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadDataElementGroups } from '../../actions/dataElements';

export class DataElementGroupSelect extends Component {

    static propTypes = {
        dataElementGroup: PropTypes.object,
        dataElementGroups: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        const { dataElementGroups, loadDataElementGroups } = this.props;

        if (!dataElementGroups) {
            loadDataElementGroups();
        }
    }

    render() {
        const { dataElementGroup, dataElementGroups, onChange, style } = this.props;

        if (!dataElementGroups) {
            return null; // TODO: Add loading indicator
        }

        return (
            <SelectField
                label={i18next.t('Data element group')}
                items={dataElementGroups}
                value={dataElementGroup ? dataElementGroup.id : null}
                onChange={onChange}
                style={style}
            />
        );
    }
}

export default connect(
    (state) => ({
        dataElementGroups: state.dataElementGroups,
    }),
    { loadDataElementGroups }
)(DataElementGroupSelect);