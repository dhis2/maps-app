import { D2Shim } from '@dhis2/app-runtime-adapter-d2'
import { CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
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
                    return (
                        <div
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                top: 0,
                            }}
                        >
                            <CenteredContent>
                                <CircularLoader />
                            </CenteredContent>
                        </div>
                    )
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
