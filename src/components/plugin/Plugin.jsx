import { CachedDataQueryProvider } from '@dhis2/analytics'
import PropTypes from 'prop-types'
import React from 'react'
import {
    DEFAULT_SYSTEM_SETTINGS,
    SYSTEM_SETTINGS,
} from '../../constants/settings.js'
import { getHiddenPeriods } from '../../util/periods.js'
import MapContainer from './MapContainer.jsx'

const query = {
    systemSettings: {
        resource: 'systemSettings',
        params: {
            key: SYSTEM_SETTINGS,
        },
    },
    currentUser: {
        resource: 'me',
        params: {
            fields: 'id,username,displayName~rename(name),authorities,settings[keyAnalysisDisplayProperty]',
        },
    },
}

const providerDataTransformation = ({ systemSettings, currentUser }) => {
    return {
        systemSettings: Object.assign(
            {},
            DEFAULT_SYSTEM_SETTINGS,
            systemSettings,
            {
                hiddenPeriods: getHiddenPeriods(systemSettings),
            }
        ),
        currentUser: {
            id: currentUser.id,
            name: currentUser.name,
            username: currentUser.username,
            authorities: new Set(currentUser.authorities),
            keyAnalysisDisplayProperty:
                currentUser.settings.keyAnalysisDisplayProperty,
        },
        nameProperty:
            currentUser.settings.keyAnalysisDisplayProperty === 'name'
                ? 'displayName'
                : 'displayShortName',
    }
}

export const Plugin = ({ visualization, displayProperty }) => {
    return (
        <CachedDataQueryProvider
            query={query}
            dataTransformation={providerDataTransformation}
            translucent={false}
        >
            <MapContainer
                visualization={visualization}
                displayProperty={displayProperty}
            />
        </CachedDataQueryProvider>
    )
}

Plugin.propTypes = {
    displayProperty: PropTypes.string,
    visualization: PropTypes.object,
}
