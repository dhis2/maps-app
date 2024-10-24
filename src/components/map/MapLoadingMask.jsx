import { ComponentCover, CenteredContent, CircularLoader } from '@dhis2/ui'
import cx from 'classnames'
import React from 'react'
import styles from './styles/MapLoadingMask.module.css'

export const loadingMaskClass = 'dhis2-map-loading-mask'

const MapLoadingMask = () => (
    <ComponentCover
        translucent
        className={cx(styles.cover, loadingMaskClass)}
        dataTest="map-loading-mask"
    >
        <CenteredContent>
            <CircularLoader />
        </CenteredContent>
    </ComponentCover>
)

export default MapLoadingMask
