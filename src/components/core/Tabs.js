import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TabBar } from '@dhis2/ui';

export const TabContext = React.createContext();

const Tabs = ({ value, onChange, children }) => {
    const [tab, setTab] = useState(value);

    useEffect(() => {
        if (value !== tab) {
            setTab(value);
        }
    }, [value, tab]);

    return (
        <TabContext.Provider value={{ tab, onChange }}>
            <TabBar fixed>{children}</TabBar>
        </TabContext.Provider>
    );
};

Tabs.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
};

export default Tabs;
