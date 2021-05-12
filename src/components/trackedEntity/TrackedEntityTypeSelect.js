import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { loadTrackedEntityTypes } from '../../actions/trackedEntities';

export class TrackedEntityTypeSelect extends Component {
    static propTypes = {
        trackedEntityType: PropTypes.object,
        trackedEntityTypes: PropTypes.array,
        errorText: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        loadTrackedEntityTypes: PropTypes.func.isRequired,
        className: PropTypes.string,
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
            className,
            errorText,
        } = this.props;

        return (
            <SelectField
                label={i18n.t('Tracked Entity Type')}
                loading={trackedEntityTypes ? false : true}
                items={trackedEntityTypes}
                value={trackedEntityType ? trackedEntityType.id : null}
                onChange={trackedEntityType => onChange(trackedEntityType)}
                className={className}
                errorText={!trackedEntityType && errorText ? errorText : null}
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
