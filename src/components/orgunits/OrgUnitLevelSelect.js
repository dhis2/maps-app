import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { once, sortBy } from 'lodash/fp';
import { isValidUid } from 'd2/uid';
import { SelectField } from '../core';
import { loadOrgUnitLevels } from '../../actions/orgUnits';

const style = {
    marginTop: 0,
    marginBottom: 24,
};

export class OrgUnitLevelSelect extends Component {
    static propTypes = {
        defaultLevel: PropTypes.number,
        orgUnitLevel: PropTypes.array,
        orgUnitLevels: PropTypes.array,
        loadOrgUnitLevels: PropTypes.func.isRequired,
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
            sortedOrgUnitLevels = sortBy(item => item.level, orgUnitLevels);
        }

        return (
            <SelectField
                label={i18n.t('Select levels')}
                loading={orgUnitLevels ? false : true}
                items={sortedOrgUnitLevels}
                value={this.getOrgUnitLevelUid(orgUnitLevel)}
                multiple={true}
                onChange={onChange}
                style={style}
                dataTest="orgunitlevelselect"
                disabled={disabled}
            />
        );
    }

    // Converts "LEVEL-x" to newer "LEVEL-uid" format
    getOrgUnitLevelUid(orgUnitLevel = []) {
        const { orgUnitLevels } = this.props;

        return Array.isArray(orgUnitLevels)
            ? orgUnitLevel
                  .filter(level =>
                      orgUnitLevels.find(
                          l => l.id === level || l.level === Number(level)
                      )
                  )
                  .map(level =>
                      isValidUid(level)
                          ? level
                          : orgUnitLevels.find(l => l.level === Number(level))
                                .id
                  )
            : [];
    }
}

export default connect(
    ({ orgUnitLevels }) => ({
        orgUnitLevels,
    }),
    { loadOrgUnitLevels }
)(OrgUnitLevelSelect);
