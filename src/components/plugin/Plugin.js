import { CachedDataQueryProvider } from '@dhis2/analytics'
import { D2Shim } from '@dhis2/app-runtime-adapter-d2'
import PropTypes from 'prop-types'
import React from 'react'
import {
    DEFAULT_SYSTEM_SETTINGS,
    SYSTEM_SETTINGS,
} from '../../constants/settings.js'
import { getHiddenPeriods } from '../../util/periods.js'
import LoadingMask from './LoadingMask.js'
import MapContainer from './MapContainer.js'

const d2Config = {
    schemas: [
        'dataElement',
        'dataSet',
        'indicator',
        'legendSet',
        'map',
        'optionSet',
        'organisationUnitGroup',
        'organisationUnitGroupSet',
        'programStage',
    ],
}

const query = {
    systemSettings: {
        resource: 'systemSettings',
        params: {
            key: SYSTEM_SETTINGS,
        },
    },
}

const providerDataTransformation = ({ systemSettings }) => {
    return {
        systemSettings: Object.assign(
            {},
            DEFAULT_SYSTEM_SETTINGS,
            systemSettings,
            {
                hiddenPeriods: getHiddenPeriods(systemSettings),
            }
        ),
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
