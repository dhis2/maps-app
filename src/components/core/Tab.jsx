import { Tab as UiTab } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useContext } from 'react'
import { TabContext } from './Tabs.jsx'

const Tab = ({ value, dataTest, children }) => {
    const { tab, onChange } = useContext(TabContext)

    // onChange is from the parent component
    const onClick = () => {
        if (value !== tab) {
            onChange(value)
        }
    }

    return (
        <UiTab selected={value === tab} onClick={onClick} dataTest={dataTest}>
            {children}
        </UiTab>
    )
}

Tab.propTypes = {
    children: PropTypes.node.isRequired,
    value: PropTypes.string.isRequired,
    dataTest: PropTypes.string,
}

export default Tab
