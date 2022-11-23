import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import memoize from 'lodash/memoize'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { apiFetch } from '../../../util/api.js'
import { SelectField } from '../../core/index.js'

const fromIsTEI = (type) =>
    type.fromConstraint.relationshipEntity === 'TRACKED_ENTITY_INSTANCE'
const fromTEIType = (type) => type.fromConstraint.trackedEntityType.id
const filterRelationshipTypes = memoize((allTypes, trackedEntityTypeId) => {
    return allTypes
        .filter((type) => {
            return fromIsTEI(type) && fromTEIType(type) === trackedEntityTypeId
        })
        .map((type) => ({
            id: type.id,
            name: type.displayName,
        }))
})

class TrackedEntityRelationshipTypeSelect extends Component {
    state = {
        allTypes: null,
        error: null,
    }

    componentDidMount() {
        const url = `/relationshipTypes?fields=id,displayName,fromConstraint`
        apiFetch(url)
            .then((response) => {
                this.setState({
                    allTypes: response.relationshipTypes,
                })
            })
            .catch(() => {
                this.setState({
                    error: i18n.t('Failed to load relationship types.'),
                })
            })
    }

    render() {
        if (!this.state.allTypes) {
            return <CircularLoader small />
        } else if (this.state.error) {
            return <span>{this.state.error}</span>
        }

        const types = filterRelationshipTypes(
            this.state.allTypes,
            this.props.trackedEntityType.id
        )
        if (!types.length) {
            return (
                <div
                    style={{
                        fontSize: 14,
                        marginLeft: 12,
                    }}
                >
                    {i18n.t(
                        'No relationship types were found for tracked entity type {{type}}',
                        { type: this.props.trackedEntityType.name }
                    )}
                </div>
            )
        }

        return (
            <SelectField
                label={i18n.t('Relationship type')}
                items={types}
                value={this.props.value}
                onChange={(type) => this.props.onChange(type.id)}
                className={this.props.className}
            />
        )
    }
}

TrackedEntityRelationshipTypeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    trackedEntityType: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }),
    value: PropTypes.string,
}

export default TrackedEntityRelationshipTypeSelect
