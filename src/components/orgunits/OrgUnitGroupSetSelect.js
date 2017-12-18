import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadOrgUnitGroupSets } from '../../actions/orgUnits';

export class OrgUnitGroupSetSelect extends Component {

    static propTypes = {
        label: PropTypes.string,
        value: PropTypes.object,
        orgUnitGroupSets: PropTypes.array,
        loadOrgUnitGroupSets: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        const { orgUnitGroupSets, loadOrgUnitGroupSets } = this.props;

        if (!orgUnitGroupSets) {
            loadOrgUnitGroupSets();
        }
    }

    render() {
        const { orgUnitGroupSets, value, onChange, style } = this.props;

        if (!orgUnitGroupSets) {
            return null; // TODO: Add loading indicator
        }

        return (
            <SelectField
                label={i18next.t('Group set')}
                items={orgUnitGroupSets}
                value={value ? value.id : null}
                onChange={onChange}
                style={style}
            />
        );
    }
}

export default connect(
    (state) => ({
        orgUnitGroupSets: state.orgUnitGroupSets,
    }), { loadOrgUnitGroupSets }
)(OrgUnitGroupSetSelect);