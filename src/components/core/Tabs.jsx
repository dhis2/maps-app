import { TabBar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'

export const TabContext = React.createContext()

const Tabs = ({ value, onChange, children }) => {
    const [tab, setTab] = useState(value)

    useEffect(() => {
        if (value !== tab) {
            setTab(value)
        }
    }, [value, tab])

    return (
        <TabContext.Provider value={{ tab, onChange }}>
            <TabBar>{children}</TabBar>
        </TabContext.Provider>
    )
}

Tabs.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default Tabs
