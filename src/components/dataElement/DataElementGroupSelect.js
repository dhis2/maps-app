import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import { loadDataElementGroups } from '../../actions/dataElements';

export class DataElementGroupSelect extends Component {
    static propTypes = {
        dataElementGroup: PropTypes.object,
        dataElementGroups: PropTypes.array,
        loadDataElementGroups: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
        errorText: PropTypes.string,
    };

    componentDidMount() {
        const { dataElementGroups, loadDataElementGroups } = this.props;

        if (!dataElementGroups) {
            loadDataElementGroups();
        }
    }

    render() {
        const {
            dataElementGroup,
            dataElementGroups,
            onChange,
            style,
            errorText,
        } = this.props;

        return (
            <SelectField
                label={i18n.t('Data element group')}
                loading={dataElementGroups ? false : true}
                items={dataElementGroups}
                value={dataElementGroup ? dataElementGroup.id : null}
                onChange={onChange}
                style={style}
                errorText={!dataElementGroup && errorText ? errorText : null}
            />
        );
    }
}

export default connect(
    state => ({
        dataElementGroups: state.dataElementGroups,
    }),
    { loadDataElementGroups }
)(DataElementGroupSelect);
