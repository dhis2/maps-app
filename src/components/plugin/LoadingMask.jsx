import { CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'

const LoadingMask = () => {
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

export default LoadingMask
