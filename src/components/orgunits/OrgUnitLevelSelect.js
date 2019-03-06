import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import once from 'lodash/fp/once';
import sortBy from 'lodash/fp/sortBy';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { loadOrgUnitLevels } from '../../actions/orgUnits';

const style = {
    width: '100%',
    marginTop: -7,
};

export class OrgUnitLevelSelect extends Component {
    static propTypes = {
        orgUnitLevel: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        orgUnitLevels: PropTypes.array,
        disabled: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    static defaultProps = {
        disabled: false,
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
            disabled,
        } = this.props;

        if (
            !disabled &&
            !orgUnitLevel.length &&
            defaultLevel &&
            orgUnitLevels
        ) {
            const levelItem = orgUnitLevels.find(
                item => item.level === defaultLevel
            );

            if (levelItem) {
                this.selectDefault([levelItem.level.toString()]);
            }
        }
    }

    render() {
        const { orgUnitLevel, orgUnitLevels, disabled, onChange } = this.props;
        let sortedOrgUnitLevels;

        if (orgUnitLevels) {
            sortedOrgUnitLevels = sortBy(item => item.level, orgUnitLevels).map(
                ({ level, name }) => ({ id: level.toString(), name })
            ); // TODO
        }

        return (
            <SelectField
                label={i18next.t('Select levels')}
                loading={orgUnitLevels ? false : true}
                items={sortedOrgUnitLevels}
                value={orgUnitLevel}
                multiple={true}
                onChange={disabled ? null : onChange}
                style={style}
                disabled={disabled}
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
