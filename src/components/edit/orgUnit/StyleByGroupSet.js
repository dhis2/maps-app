import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import OrgUnitGroupSetSelect from '../../orgunits/OrgUnitGroupSetSelect';
import { setOrganisationUnitGroupSet } from '../../../actions/layerEdit';
import styles from '../styles/LayerDialog.module.css';

export const StyleByGroupSet = ({
    organisationUnitGroupSet,
    setOrganisationUnitGroupSet,
}) => {
    return (
        <div>
            <OrgUnitGroupSetSelect
                label={i18n.t('Style by group set')}
                value={organisationUnitGroupSet}
                onChange={setOrganisationUnitGroupSet}
                className={styles.select}
            />
        </div>
    );
};

StyleByGroupSet.propTypes = {
    organisationUnitGroupSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    setOrganisationUnitGroupSet: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        organisationUnitGroupSet: layerEdit.organisationUnitGroupSet,
    }),
    { setOrganisationUnitGroupSet }
)(StyleByGroupSet);
