import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { IconCross24 } from '@dhis2/ui';
import Drawer from '../core/Drawer';
import { closeFeatureProfile } from '../../actions/feature';
import styles from './styles/FeatureProfile.module.css';

/*
 *  Loads an org unit profile and displays it in a right drawer component
 */
export const FeatureProfile = ({ fields, data, closeFeatureProfile }) => {
    if (!fields || !data) {
        return null;
    }

    return (
        <Drawer className={styles.drawer}>
            <div className={styles.header}>
                {i18n.t('Feature profile')}
                <span className={styles.close} onClick={closeFeatureProfile}>
                    <IconCross24 />
                </span>
            </div>
            <div className={styles.content}>
                <div className={styles.orgUnitData}>
                    <div className={styles.dataTable}>
                        <table>
                            <tbody>
                                {fields.map(({ name }) => (
                                    <tr key={name}>
                                        <th>{name}</th>
                                        <td>{data[name]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Drawer>
    );
};

FeatureProfile.propTypes = {
    fields: PropTypes.array,
    data: PropTypes.object,
    closeFeatureProfile: PropTypes.func.isRequired,
};

export default connect(
    ({ featureProfile }) => ({
        ...featureProfile,
    }),
    { closeFeatureProfile }
)(FeatureProfile);
