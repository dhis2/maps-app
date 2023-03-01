import { D2Shim } from '@dhis2/app-runtime-adapter-d2'
import React from 'react'
import SystemSettingsProvider, {
    SystemSettingsCtx,
} from '../SystemSettingsProvider.js'
import LoadingMask from './LoadingMask.js'
import MapContainer from './MapContainer.js'

const d2Config = {
    schemas: [
        'dataElement',
        'dataSet',
        'externalMapLayer',
        'indicator',
        'legendSet',
        'map',
        'optionSet',
        'organisationUnitGroup',
        'organisationUnitGroupSet',
        'organisationUnitLevel',
        'programStage',
    ],
}

export const Plugin = (props) => {
    return (
        <D2Shim d2Config={d2Config}>
            {({ d2, d2Error }) => {
                if (!d2 && !d2Error) {
                    return <LoadingMask />
                }

                return (
                    <SystemSettingsProvider>
                        <SystemSettingsCtx.Consumer>
                            {(settings) => {
                                if (!settings.keyDefaultBaseMap) {
                                    return null
                                }
                                return <MapContainer {...props} />
                            }}
                        </SystemSettingsCtx.Consumer>
                    </SystemSettingsProvider>
                )
            }}
        </D2Shim>
    )
}
