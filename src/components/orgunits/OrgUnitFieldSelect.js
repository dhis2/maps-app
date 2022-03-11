import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { fetchOrgUnitFields } from '../../util/orgUnits';
import { setOrganisationUnitField } from '../../actions/layerEdit';
import { NONE } from '../../constants/layers';

export const OrgUnitFieldSelect = ({
    orgUnitField,
    setOrganisationUnitField,
}) => {
    const [attributes, setAttributes] = useState([]);

    useEffect(() => {
        fetchOrgUnitFields().then(setAttributes);
    }, []);

    if (!attributes.length) {
        return null;
    }

    return (
        <SelectField
            label={i18n.t('Use associated geometry')}
            items={[{ id: NONE, name: i18n.t('None') }, ...attributes]}
            value={orgUnitField}
            onChange={setOrganisationUnitField}
            data-test="orgunitfieldselect"
        />
    );
};

OrgUnitFieldSelect.propTypes = {
    orgUnitField: PropTypes.string,
    setOrganisationUnitField: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        orgUnitField: layerEdit.orgUnitField,
    }),
    { setOrganisationUnitField }
)(OrgUnitFieldSelect);
