import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TabBar as UiTabBar } from '@dhis2/ui';

export const TabContext = React.createContext();

// Calls onChange when child tab is clicked
const TabBar = ({ value, onChange, children }) => {
    const [state, setState] = useState({
        tab: value,
        setTab: tab => setState({ ...state, tab }),
    });

    useEffect(() => {
        if (state.tab !== value) {
            onChange(state.tab);
        }
    }, [state, value, onChange]);

    return (
        <TabContext.Provider value={state}>
            <UiTabBar fixed>{children}</UiTabBar>
        </TabContext.Provider>
    );
};

TabBar.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
};

export default TabBar;
