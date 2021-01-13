import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../../core/SelectField';
import { apiFetch } from '../../../util/api';

const DataSetSelect = ({ value, onChange }) => {
    const [dataSets, setDataSets] = useState();

    useEffect(() => {
        apiFetch('/dataSets?fields=id,code,name,periodType&paging=false')
            .then(({ dataSets }) => dataSets)
            .then(setDataSets)
            .catch(console.error); // TODO
    }, []);

    return (
        <SelectField
            label={i18n.t('Data set')}
            items={dataSets}
            value={value}
            onChange={onChange}
        />
    );
};

DataSetSelect.propTypes = {
    value: PropTypes.string,
    periodType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default DataSetSelect;
