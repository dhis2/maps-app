import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import CircularProgress from '@material-ui/core/CircularProgress';
import SelectField from '../../core/SelectField';
import memoize from 'lodash/memoize';
import { apiFetch } from '../../../util/api';

const fromIsTEI = type =>
    type.fromConstraint.relationshipEntity === 'TRACKED_ENTITY_INSTANCE';
const fromTEIType = type => type.fromConstraint.trackedEntityType.id;
const filterRelationshipTypes = memoize((allTypes, trackedEntityType) => {
    return allTypes
        .filter(type => {
            return fromIsTEI(type) && fromTEIType(type) === trackedEntityType;
        })
        .map(type => ({
            id: type.id,
            name: type.displayName,
        }));
});

class TrackedEntityRelationshipTypeSelect extends Component {
    state = {
        allTypes: null,
        error: null,
    };

    componentDidMount() {
        const url = `/relationshipTypes?fields=id,displayName,fromConstraint`;
        apiFetch(url)
            .then(response => {
                this.setState({
                    allTypes: response.relationshipTypes,
                });
            })
            .catch(() => {
                this.setState({
                    error: i18n.t('Failed to load relationship types.'),
                });
            });
    }

    render() {
        if (!this.props.trackedEntityType) {
            return (
                <div>
                    {i18n.t(
                        'Select a Tracked Entity Type before selecting a Relationship Type'
                    )}
                </div>
            );
        } else if (!this.state.allTypes) {
            return <CircularProgress />;
        } else if (this.state.error) {
            return <span>{this.state.error}</span>;
        }

        return (
            <SelectField
                label={i18n.t('Relationship type')}
                items={filterRelationshipTypes(
                    this.state.allTypes,
                    this.props.trackedEntityType
                )}
                value={this.props.value}
                onChange={type => this.props.onChange(type.id)}
                style={{
                    width: '100%',
                }}
            />
        );
    }
}

TrackedEntityRelationshipTypeSelect.propTypes = {
    value: PropTypes.string,
    trackedEntityType: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default TrackedEntityRelationshipTypeSelect;
