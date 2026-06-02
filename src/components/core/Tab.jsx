import { Tab as UiTab } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useContext, forwardRef } from 'react'
import { TabContext } from './Tabs.jsx'

const Tab = forwardRef(({ value, dataTest, children }, ref) => {
    const { tab, onChange } = useContext(TabContext)

    const onClick = () => {
        if (value !== tab) {
            onChange(value)
        }
    }

    return (
        <UiTab
            ref={ref}
            selected={value === tab}
            onClick={onClick}
            dataTest={dataTest}
        >
            {children}
        </UiTab>
    )
})

Tab.displayName = 'Tab'

Tab.propTypes = {
    children: PropTypes.node.isRequired,
    value: PropTypes.string.isRequired,
    dataTest: PropTypes.string,
}

export default Tab
