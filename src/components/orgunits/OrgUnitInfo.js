import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { IconDimensionOrgUnit16 } from '@dhis2/ui';
import ListItem from '../core/ListItem';
import { formatDate } from '../../util/time';
import { numberPrecision } from '../../util/numbers';
import styles from './styles/OrgUnitInfo.module.css';

export const coordFormat = numberPrecision(6); // Meter precision for longitude an latitude

/*
 * Displays the fixed information for an org unit together with org unit groups (above) and metadata attributes (below)
 *
 * Available org unit info fields:
 * https://github.com/dhis2/dhis2-core/blob/master/dhis-2/dhis-services/dhis-service-reporting/src/main/java/org/hisp/dhis/orgunitprofile/OrgUnitInfo.java
 */
const OrgUnitInfo = ({
    id,
    code,
    name,
    shortName,
    description,
    parentName,
    levelName,
    level,
    openingDate,
    closedDate,
    comment,
    url,
    contactPerson,
    address,
    email,
    phoneNumber,
    longitude,
    latitude,
    groupSets,
    attributes,
}) => (
    <div className={styles.info}>
        {name && <h3>{name}</h3>}
        {(level || levelName) && (
            <div className={styles.level}>
                <IconDimensionOrgUnit16 />
                {i18n.t('Level')}:{' '}
                {levelName
                    ? `${levelName}${level ? ` (${level})` : ''}`
                    : level}
            </div>
        )}
        {parentName && (
            <div className={styles.level}>
                <IconDimensionOrgUnit16 />
                {i18n.t('Parent')}: {parentName}
            </div>
        )}
        {description && <div className={styles.desc}>{description}</div>}
        <div className={styles.list}>
            {groupSets.map(({ id, label, value }) => (
                <ListItem key={id} label={label}>
                    {value}
                </ListItem>
            ))}
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
            <ListItem label={i18n.t('Comment')}>{comment}</ListItem>
            {attributes.map(({ id, label, value }) => (
                <ListItem key={id} label={label}>
                    {value}
                </ListItem>
            ))}
        </div>
    </div>
);

OrgUnitInfo.propTypes = {
    id: PropTypes.string.isRequired,
    code: PropTypes.string,
    name: PropTypes.string,
    shortName: PropTypes.string,
    description: PropTypes.string,
    parentName: PropTypes.string,
    levelName: PropTypes.string,
    level: PropTypes.number,
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
    groupSets: PropTypes.array.isRequired,
    attributes: PropTypes.array.isRequired,
};

export default OrgUnitInfo;
