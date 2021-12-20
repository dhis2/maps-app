import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { IconClockHistory16 } from '@dhis2/ui';
import { formatLocaleDate } from '../../util/time';
import { useUserSettings } from '../UserSettingsProvider';
import styles from './styles/MapName.module.css';

const MapName = ({ showName, name, interpretationDate }) => {
    const { userSettings } = useUserSettings();
    return showName && name ? (
        <div className={styles.mapName}>
            <div className={`${styles.name} dhis2-maps-title`}>{name}</div>
            {interpretationDate && (
                <div className={styles.interpretation}>
                    <IconClockHistory16 />
                    {i18n.t(
                        'Viewing interpretation from {{interpretationDate}}',
                        {
                            interpretationDate: formatLocaleDate(
                                interpretationDate,
                                userSettings.keyUiLocale || 'en'
                            ),
                        }
                    )}
                </div>
            )}
        </div>
    ) : null;
};

MapName.propTypes = {
    showName: PropTypes.bool,
    name: PropTypes.string,
    interpretationDate: PropTypes.string,
    uiLocale: PropTypes.string,
};

export default connect(({ map, download }) => ({
    name: map.name,
    interpretationDate: map.interpretationDate,
    showName: download.showDialog ? download.showName : true,
}))(MapName);
