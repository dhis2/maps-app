import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { once, sortBy } from 'lodash/fp';
import { SelectField } from '@dhis2/d2-ui-core';
import { loadOrgUnitLevels } from '../../actions/orgUnits';

const style = {
    width: '100%',
    marginTop: -7,
};

export class OrgUnitLevelSelect extends Component {
    static propTypes = {
        orgUnitLevel: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        orgUnitLevels: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    constructor(props, context) {
        super(props, context);

        this.selectDefault = once(level => props.onChange(level)); // only select default level once
    }

    componentDidMount() {
        const { orgUnitLevels, loadOrgUnitLevels } = this.props;

        if (!orgUnitLevels) {
            loadOrgUnitLevels();
        }
    }

    componentDidUpdate() {
        const {
            defaultLevel,
            orgUnitLevel,
            orgUnitLevels,
            onChange,
        } = this.props;

        if (!orgUnitLevel.length && defaultLevel && orgUnitLevels) {
            const levelItem = orgUnitLevels.find(
                item => item.level === defaultLevel
            );

            if (levelItem) {
                this.selectDefault([levelItem.level.toString()]);
            }
        }
    }

    render() {
        const { orgUnitLevel, orgUnitLevels, onChange } = this.props;
        let sortedOrgUnitLevels;

        if (orgUnitLevels) {
            sortedOrgUnitLevels = sortBy(item => item.level, orgUnitLevels).map(
                ({ level, name }) => ({ id: level.toString(), name })
            ); // TODO
        }

        return (
            <SelectField
                label={i18n.t('Select levels')}
                loading={orgUnitLevels ? false : true}
                items={sortedOrgUnitLevels}
                value={orgUnitLevel}
                multiple={true}
                onChange={onChange}
                style={style}
            />
        );
    }
}

export default connect(
    state => ({
        orgUnitLevels: state.orgUnitLevels,
    }),
    { loadOrgUnitLevels }
)(OrgUnitLevelSelect);
