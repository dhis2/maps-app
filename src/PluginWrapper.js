import { DashboardPluginWrapper } from '@dhis2/analytics'
import { debounce } from 'lodash/fp'
import React, { useLayoutEffect, useState } from 'react'
import { Plugin } from './components/plugin/Plugin.js'
import './locales/index.js'

const PluginWrapper = (props) => {
    const [renderId, setRenderId] = useState(null)

    useLayoutEffect(() => {
        const updateRenderId = debounce(300, () =>
            setRenderId((renderId) =>
                typeof renderId === 'number' ? renderId + 1 : 1
            )
        )

        window.addEventListener('resize', updateRenderId)

        return () => window.removeEventListener('resize', updateRenderId)
    }, [])

    return (
        <DashboardPluginWrapper {...props}>
            {(props) => <Plugin id={renderId} {...props} />}
        </DashboardPluginWrapper>
    )
}

export default PluginWrapper
