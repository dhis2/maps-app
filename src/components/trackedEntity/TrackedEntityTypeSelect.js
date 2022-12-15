import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadTrackedEntityTypes } from '../../actions/trackedEntities.js'
import { SelectField } from '../core/index.js'

class TrackedEntityTypeSelect extends Component {
    static propTypes = {
        loadTrackedEntityTypes: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        errorText: PropTypes.string,
        trackedEntityType: PropTypes.object,
        trackedEntityTypes: PropTypes.array,
    }

    componentDidMount() {
        const { trackedEntityTypes, loadTrackedEntityTypes } = this.props

        if (!trackedEntityTypes) {
            loadTrackedEntityTypes()
        }
    }

    render() {
        const {
            trackedEntityType,
            trackedEntityTypes,
            onChange,
            className,
            errorText,
        } = this.props

        return (
            <SelectField
                label={i18n.t('Tracked Entity Type')}
                loading={trackedEntityTypes ? false : true}
                items={trackedEntityTypes}
                value={trackedEntityType ? trackedEntityType.id : null}
                onChange={(trackedEntityType) => onChange(trackedEntityType)}
                className={className}
                errorText={!trackedEntityType && errorText ? errorText : null}
                dataTest="tetypeselect"
            />
        )
    }
}

export default connect(
    (state) => ({
        trackedEntityTypes: state.trackedEntityTypes,
    }),
    { loadTrackedEntityTypes }
)(TrackedEntityTypeSelect)
