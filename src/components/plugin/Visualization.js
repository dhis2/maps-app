import { D2Shim } from '@dhis2/app-runtime-adapter-d2'
import React from 'react'
import LoadingMask from '../LoadingMask.js'
import SystemSettingsProvider, {
    SystemSettingsCtx,
} from '../SystemSettingsProvider.js'
import Plugin from './NewPlugin.js'

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

export const VisualizationPlugin = (props) => {
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
                                return <Plugin {...props} />
                            }}
                        </SystemSettingsCtx.Consumer>
                    </SystemSettingsProvider>
                )
            }}
        </D2Shim>
    )
}
