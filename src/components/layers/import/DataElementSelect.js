import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../../core/SelectField';
import { apiFetch } from '../../../util/api';

const DataElementSelect = ({ dataSet, value, onChange }) => {
    const [dataElements, setDataElements] = useState();

    useEffect(() => {
        const url = `/dataSets?fields=dataSetElements[dataElement[id,code,name]]&filter=id:eq:${dataSet.id}&paging=false`;

        apiFetch(url).then(data => {
            const { dataSetElements } = data.dataSets[0];
            setDataElements(dataSetElements.map(d => d.dataElement));
        });
        // .catch(console.error); // TODO
    }, [dataSet]);

    return (
        <SelectField
            label={i18n.t('Data element')}
            items={dataElements}
            value={value}
            onChange={onChange}
        />
    );
};

DataElementSelect.propTypes = {
    dataSet: PropTypes.object.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default DataElementSelect;
