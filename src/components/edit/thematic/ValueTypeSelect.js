import React from 'react';
import i18next from 'i18next';
import { connect } from 'react-redux';
import { SelectField } from '@dhis2/d2-ui-core';
import { dimConf } from '../../../constants/dimension';
import { setValueType } from '../../../actions/layerEdit';

const ValueTypeSelect = props => {
    const { value, onChange } = props;

    // console.log(dimConf.indicator.objectName);

    // TODO: Avoid creating on each render (needs to be created after i18next conatins transaltions
    const items = [
        { id: dimConf.indicator.objectName, name: i18next.t('Indicator') },
        { id: dimConf.dataElement.objectName, name: i18next.t('Data element') },
        { id: dimConf.dataSet.objectName, name: i18next.t('Reporting rates') },
        {
            id: dimConf.eventDataItem.objectName,
            name: i18next.t('Event data items'),
        },
        {
            id: dimConf.programIndicator.objectName,
            name: i18next.t('Program indicators'),
        },
    ];

    return (
        <SelectField
            {...props}
            label={i18next.t('Item type')}
            items={items}
            // value={value || dimConf.indicator.objectName}
            value={value}
            onChange={valueType => onChange(valueType.id)}
        />
    );
};

export default ValueTypeSelect;
