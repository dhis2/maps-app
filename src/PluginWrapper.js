import { DashboardPluginWrapper } from '@dhis2/analytics'
import { debounce } from 'lodash/fp'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Plugin } from './components/plugin/Plugin.js'
import './locales/index.js'

const PluginWrapper = (props) => {
    const [propsFromParent, setPropsFromParent] = useState(props)
    const [renderId, setRenderId] = useState(null)

    useEffect(() => setPropsFromParent(props), [props])

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
        <DashboardPluginWrapper {...propsFromParent}>
            {(props) => <Plugin id={renderId} {...props} />}
        </DashboardPluginWrapper>
    )
}

export default PluginWrapper
