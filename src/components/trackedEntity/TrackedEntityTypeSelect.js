import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '@dhis2/d2-ui-core';
import { loadTrackedEntityTypes } from '../../actions/trackedEntities';

export class TrackedEntityTypeSelect extends Component {
    static propTypes = {
        trackedEntityType: PropTypes.object,
        trackedEntityTypes: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        style: PropTypes.object,
    };

    componentDidMount() {
        const { trackedEntityTypes, loadTrackedEntityTypes } = this.props;

        if (!trackedEntityTypes) {
            loadTrackedEntityTypes();
        }
    }

    render() {
        const {
            trackedEntityType,
            trackedEntityTypes,
            onChange,
            style,
        } = this.props;

        return (
            <SelectField
                label={i18n.t('Tracked Entity Type')}
                loading={trackedEntityTypes ? false : true}
                items={trackedEntityTypes}
                value={trackedEntityType ? trackedEntityType.id : null}
                onChange={trackedEntityType => onChange(trackedEntityType)}
                style={style}
            />
        );
    }
}

export default connect(
    state => ({
        trackedEntityTypes: state.trackedEntityTypes,
    }),
    { loadTrackedEntityTypes }
)(TrackedEntityTypeSelect);
