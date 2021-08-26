import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import OrgUnitGroupSetSelect from '../orgunits/OrgUnitGroupSetSelect';
import GroupSetStyle from './GroupSetStyle';
import { setOrganisationUnitGroupSet } from '../../actions/layerEdit';
import styles from '../edit/styles/LayerDialog.module.css';

export const StyleByGroupSet = ({
    defaultStyleType,
    groupSet,
    setOrganisationUnitGroupSet,
}) => {
    return (
        <div>
            <OrgUnitGroupSetSelect
                label={i18n.t('Style by group set')}
                value={groupSet}
                allowNone={true}
                onChange={setOrganisationUnitGroupSet}
                className={styles.select}
            />
            {groupSet && (
                <GroupSetStyle
                    defaultStyleType={defaultStyleType}
                    groupSet={groupSet}
                />
            )}
        </div>
    );
};

StyleByGroupSet.propTypes = {
    defaultStyleType: PropTypes.string,
    groupSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    styleDataItem: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    setOrganisationUnitGroupSet: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        groupSet: layerEdit.organisationUnitGroupSet,
        styleDataItem: layerEdit.styleDataItem,
    }),
    { setOrganisationUnitGroupSet }
)(StyleByGroupSet);
