import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'

export const loadingMaskClass = 'dhis2-map-loading-mask'

const MapLoadingMask = () => (
    <ComponentCover className={loadingMaskClass} dataTest="map-loading-mask">
        <CenteredContent>
            <CircularLoader />
        </CenteredContent>
    </ComponentCover>
)

export default MapLoadingMask
