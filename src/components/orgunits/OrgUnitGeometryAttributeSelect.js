import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { fetchOrgUnitGeometryAttributes } from '../../util/orgUnits';
import { setOrganisationUnitGeometryAttribute } from '../../actions/layerEdit';

export const OrgUnitGeometryAttributeSelect = ({
    geometryAttribute,
    setOrganisationUnitGeometryAttribute,
}) => {
    const [attributes, setAttributes] = useState([]);

    useEffect(() => {
        fetchOrgUnitGeometryAttributes().then(setAttributes);
    }, []);

    if (!attributes.length) {
        return null;
    }

    return (
        <SelectField
            label={i18n.t('Use associated geometry')}
            items={[{ id: 'none', name: i18n.t('None') }, ...attributes]}
            value={geometryAttribute ? geometryAttribute.id : null}
            onChange={setOrganisationUnitGeometryAttribute}
            data-test="orgunitgeometryattributeselect"
        />
    );
};

OrgUnitGeometryAttributeSelect.propTypes = {
    geometryAttribute: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    setOrganisationUnitGeometryAttribute: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        geometryAttribute: layerEdit.geometryAttribute,
    }),
    { setOrganisationUnitGeometryAttribute }
)(OrgUnitGeometryAttributeSelect);
