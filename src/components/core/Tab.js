import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Tab as UiTab } from '@dhis2/ui';
import { TabContext } from './TabBar';

// Move click handling to parent TabBar
const Tab = ({ value, dataTest, children }) => {
    const { tab, setTab } = useContext(TabContext);

    return (
        <UiTab
            selected={value === tab}
            onClick={() => setTab(value)}
            dataTest={dataTest}
        >
            {children}
        </UiTab>
    );
};

Tab.propTypes = {
    value: PropTypes.string.isRequired,
    dataTest: PropTypes.string,
    children: PropTypes.node.isRequired,
};

export default Tab;
