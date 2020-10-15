import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Tab as UiTab } from '@dhis2/ui';
import { TabContext } from './Tabs';

const Tab = ({ value, dataTest, children }) => {
    const { tab, onChange } = useContext(TabContext);

    // onChange is from the parent component
    const onClick = () => {
        if (value !== tab) {
            onChange(value);
        }
    };

    return (
        <UiTab selected={value === tab} onClick={onClick} dataTest={dataTest}>
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
