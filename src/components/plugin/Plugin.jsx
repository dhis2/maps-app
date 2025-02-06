import { CachedDataQueryProvider } from '@dhis2/analytics'
import { D2Shim } from '@dhis2/app-runtime-adapter-d2'
import PropTypes from 'prop-types'
import React from 'react'
import {
    DEFAULT_SYSTEM_SETTINGS,
    SYSTEM_SETTINGS,
} from '../../constants/settings.js'
import { getHiddenPeriods } from '../../util/periods.js'
import LoadingMask from './LoadingMask.jsx'
import MapContainer from './MapContainer.jsx'

const d2Config = {
    schemas: [],
}

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
        <D2Shim d2Config={d2Config}>
            {({ d2, d2Error }) => {
                if (!d2 && !d2Error) {
                    return <LoadingMask />
                }

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
            }}
        </D2Shim>
    )
}

Plugin.propTypes = {
    displayProperty: PropTypes.string,
    visualization: PropTypes.object,
}
