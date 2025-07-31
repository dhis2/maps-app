import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { IconDimensionOrgUnit16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { getRoundToPrecisionFn } from '../../util/numbers.js'
import { formatDate } from '../../util/time.js'
import ListItem from '../core/ListItem.jsx'
import styles from './styles/OrgUnitInfo.module.css'

export const coordFormat = getRoundToPrecisionFn(6) // Meter precision for longitude an latitude

/*
 * Displays the fixed information for an org unit together with org unit groups (above) and metadata attributes (below)
 *
 * Available org unit info fields:
 * https://github.com/dhis2/dhis2-core/blob/master/dhis-2/dhis-services/dhis-service-reporting/src/main/java/org/hisp/dhis/orgunitprofile/OrgUnitInfo.java
 */
const OrgUnitInfo = ({
    address,
    attributes,
    closedDate,
    code,
    comment,
    contactPerson,
    description,
    email,
    featureType,
    groupSets,
    id,
    imageId,
    latitude,
    level,
    levelName,
    longitude,
    name,
    openingDate,
    parentName,
    phoneNumber,
    shortName,
    url,
}) => {
    const { baseUrl } = useConfig()
    return (
        <div className={styles.info} data-test="org-unit-info">
            {imageId && (
                <img
                    src={`${baseUrl}/api/fileResources/${imageId}/data`}
                    alt={i18n.t('Image of the organisation unit')}
                />
            )}
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
                {featureType === 'POINT' && (
                    <>
                        <ListItem
                            label={i18n.t('Opening date')}
                            formatter={formatDate}
                        >
                            {openingDate}
                        </ListItem>
                        <ListItem
                            label={i18n.t('Closed date')}
                            formatter={formatDate}
                        >
                            {closedDate}
                        </ListItem>
                    </>
                )}
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
    )
}

OrgUnitInfo.propTypes = {
    attributes: PropTypes.array.isRequired,
    groupSets: PropTypes.array.isRequired,
    id: PropTypes.string.isRequired,
    address: PropTypes.string,
    closedDate: PropTypes.string,
    code: PropTypes.string,
    comment: PropTypes.string,
    contactPerson: PropTypes.string,
    description: PropTypes.string,
    email: PropTypes.string,
    featureType: PropTypes.string,
    imageId: PropTypes.string,
    latitude: PropTypes.number,
    level: PropTypes.number,
    levelName: PropTypes.string,
    longitude: PropTypes.number,
    name: PropTypes.string,
    openingDate: PropTypes.string,
    parentName: PropTypes.string,
    phoneNumber: PropTypes.string,
    shortName: PropTypes.string,
    url: PropTypes.string,
}

export default OrgUnitInfo
