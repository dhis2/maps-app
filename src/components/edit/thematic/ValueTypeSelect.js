import React from 'react';
import i18next from 'i18next';
import { connect } from 'react-redux';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { dimConf } from '../../../constants/dimension';
import { setValueType } from '../../../actions/layerEdit';

export const ValueTypeSelect = (props) => {
    const { value, setValueType } = props;

    // TODO: Avoid creating on each render (needs to be created after i18next conatins transaltions
    const items = [
        { id: dimConf.indicator.objectName, name: i18next.t('Indicator') },
        { id: dimConf.dataElement.objectName, name: i18next.t('Data element') },
        { id: dimConf.dataSet.objectName, name: i18next.t('Reporting rates') },
        { id: dimConf.eventDataItem.objectName, name: i18next.t('Event data items') },
        { id: dimConf.programIndicator.objectName, name: i18next.t('Program indicators') },
    ];

    return (
        <SelectField
            {...props}
            label={i18next.t('Item type')}
            items={items}
            value={value || dimConf.indicator.objectName}
            onChange={(valueType) => setValueType(valueType.id)}
        />
    );

};

export default connect(null, { setValueType })(ValueTypeSelect);
