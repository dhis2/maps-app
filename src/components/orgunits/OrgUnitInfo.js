import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import ListItem from '../core/ListItem';
import { formatDate } from '../../util/time';
import { numberPrecision } from '../../util/numbers';
import styles from './styles/OrgUnitInfo.module.css';

const coordFormat = numberPrecision(6);

// https://github.com/dhis2/dhis2-core/blob/master/dhis-2/dhis-services/dhis-service-reporting/src/main/java/org/hisp/dhis/orgunitprofile/OrgUnitInfo.java
// https://www.sketch.com/s/bbd5189d-b84d-4ecb-9c54-9c34d3070c59/a/3OD01Dm#Inspector
// TODO: Address formatting
const OrgUnitInfo = ({
    id,
    code,
    name,
    shortName,
    description,
    openingDate,
    closedDate,
    // comment,
    url,
    contactPerson,
    address,
    email,
    phoneNumber,
    longitude,
    latitude,
}) => {
    return (
        <div className={styles.info}>
            <h3>{name}</h3>
            {description && <div className={styles.desc}>{description}</div>}
            <div>
                <ListItem label={i18n.t('Code')}>{code}</ListItem>
                <ListItem label={i18n.t('Short name')}>{shortName}</ListItem>
                <ListItem label={i18n.t('Opening date')} formatter={formatDate}>
                    {openingDate}
                </ListItem>
                <ListItem label={i18n.t('Closed date')} formatter={formatDate}>
                    {closedDate}
                </ListItem>
                {url && (
                    <ListItem label={i18n.t('URL')}>
                        <a href={url} target="_blank" rel="noreferrer">
                            {i18n.t('Link')}
                        </a>
                    </ListItem>
                )}
                <ListItem label={i18n.t('Contact')}>{contactPerson}</ListItem>
                <ListItem label={i18n.t('Email')}>{email}</ListItem>
                <ListItem label={i18n.t('Address')}>{address}</ListItem>
                <ListItem label={i18n.t('Phone')}>{phoneNumber}</ListItem>
                <ListItem label={i18n.t('Longitude')} formatter={coordFormat}>
                    {longitude}
                </ListItem>
                <ListItem label={i18n.t('Latitude')} formatter={coordFormat}>
                    {latitude}
                </ListItem>
                <ListItem label={i18n.t('ID')}>{id}</ListItem>
            </div>
        </div>
    );
};

OrgUnitInfo.propTypes = {
    id: PropTypes.string.isRequired,
    code: PropTypes.string,
    name: PropTypes.string,
    shortName: PropTypes.string,
    description: PropTypes.string,
    openingDate: PropTypes.string,
    closedDate: PropTypes.string,
    comment: PropTypes.string,
    url: PropTypes.string,
    contactPerson: PropTypes.string,
    address: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    longitude: PropTypes.number,
    latitude: PropTypes.number,
};

export default OrgUnitInfo;
