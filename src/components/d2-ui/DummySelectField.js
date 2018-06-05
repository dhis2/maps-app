import React, { Component } from 'react';
import { SelectField } from '@dhis2/d2-ui-core';

// Used when favorite is loaded, and we don't know the used item
const DummySelectField = ({ label, item, style }) => (
    <SelectField
        label={label}
        items={[item]}
        value={item.id}
        onChange={() => {}}
        style={style}
    />
);

export default DummySelectField;
