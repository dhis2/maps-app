import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadOrgUnitLevels } from '../../actions/orgUnits';

const style = {
    width: '100%',
    marginTop: -7,
};

export class OrgUnitLevelSelect extends Component {

    static propTypes = {
        orgUnitLevel: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]),
        orgUnitLevels: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        const { orgUnitLevels, loadOrgUnitLevels } = this.props;

        if (!orgUnitLevels) {
            loadOrgUnitLevels();
        }
    }

    render() {
        const { orgUnitLevel, orgUnitLevels, onChange } = this.props;

        if (!orgUnitLevels) {
            return null; // TODO: Add loading indicator
        }

        return (
            <SelectField
                label={i18next.t('Select levels')}
                items={orgUnitLevels.map(({ level, name }) => ({ id: level.toString(), name }))}
                value={orgUnitLevel}
                multiple={true}
                onChange={onChange}
                style={style}
            />
        );
    }
}

export default connect(
    (state) => ({
        orgUnitLevels: state.orgUnitLevels,
    }),
    { loadOrgUnitLevels }
)(OrgUnitLevelSelect);
