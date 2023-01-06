import { useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { createContext } from 'react'

export const BaseUrlCtx = createContext({})

const BaseUrlProvider = ({ children }) => {
    const cfg = useConfig()
    // console.log('cfg', cfg)

    return (
        <BaseUrlCtx.Provider value={cfg.baseUrl}>
            {children}
        </BaseUrlCtx.Provider>
    )
}

BaseUrlProvider.propTypes = {
    children: PropTypes.node,
}

export default BaseUrlProvider
