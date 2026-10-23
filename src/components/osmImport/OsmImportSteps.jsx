import i18n from '@dhis2/d2-i18n'
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableRow,
    NoticeBox,
    OrganisationUnitTree,
    Radio,
    Tag,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import {
    OSM_STATUS_CHANGED,
    OSM_STATUS_NEW,
    OSM_STATUS_UNCHANGED,
} from '../../util/osm.js'
import styles from './styles/OsmImport.module.css'

const MAX_PREVIEW_ROWS = 100

const getStatusLabels = () => ({
    [OSM_STATUS_NEW]: i18n.t('New'),
    [OSM_STATUS_CHANGED]: i18n.t('Changed'),
    [OSM_STATUS_UNCHANGED]: i18n.t('Unchanged'),
})

export const SetupStep = ({ missingPrograms, canSetup }) => (
    <div className={styles.step}>
        <p>
            {i18n.t(
                'OSM data is stored as events. The following programs are missing on this server and will be created, with their program stages and data elements:'
            )}
        </p>
        <ul>
            {missingPrograms.map((code) => (
                <li key={code}>
                    <code>{code}</code>
                </li>
            ))}
        </ul>
        {!canSetup && (
            <NoticeBox warning>
                {i18n.t(
                    'You need the authorities to add programs and data elements. Ask a system administrator to open this dialog and run the setup.'
                )}
            </NoticeBox>
        )}
    </div>
)

SetupStep.propTypes = {
    canSetup: PropTypes.bool.isRequired,
    missingPrograms: PropTypes.array.isRequired,
}

export const SelectStep = ({
    categories,
    category,
    orgUnit,
    roots,
    onCategoryChange,
    onOrgUnitChange,
}) => (
    <div className={styles.select}>
        <div className={styles.column}>
            <h3 className={styles.heading}>{i18n.t('Data')}</h3>
            {categories.map(({ id, name, mocked, note }) => (
                <div key={id} className={styles.category}>
                    <Radio
                        dense
                        label={name}
                        value={id}
                        checked={category?.id === id}
                        disabled={mocked}
                        onChange={() => onCategoryChange(id)}
                    />
                    {mocked && <Tag>{i18n.t('Mocked')}</Tag>}
                    {note && <div className={styles.note}>{note}</div>}
                </div>
            ))}
        </div>
        <div className={styles.column}>
            <h3 className={styles.heading}>{i18n.t('Area')}</h3>
            <div className={styles.tree}>
                <OrganisationUnitTree
                    roots={roots}
                    singleSelection
                    selected={orgUnit ? [orgUnit.path] : []}
                    onChange={({ id, path, displayName, selected }) =>
                        onOrgUnitChange(
                            selected.length
                                ? { id, path, name: displayName }
                                : null
                        )
                    }
                />
            </div>
        </div>
    </div>
)

SelectStep.propTypes = {
    categories: PropTypes.array.isRequired,
    roots: PropTypes.array.isRequired,
    onCategoryChange: PropTypes.func.isRequired,
    onOrgUnitChange: PropTypes.func.isRequired,
    category: PropTypes.object,
    orgUnit: PropTypes.object,
}

export const PreviewStep = ({ category, orgUnit, features }) => {
    const labels = getStatusLabels()
    const counts = features.reduce((acc, { status }) => {
        acc[status] = (acc[status] ?? 0) + 1
        return acc
    }, {})

    return (
        <div className={styles.step}>
            <p>
                {i18n.t(
                    '{{count}} features found in OpenStreetMap for {{- category}} in {{- orgUnit}}.',
                    {
                        count: features.length,
                        category: category.name,
                        orgUnit: orgUnit.name,
                    }
                )}
            </p>
            <div className={styles.counts}>
                {Object.entries(labels).map(([status, label]) => (
                    <Tag
                        key={status}
                        positive={status === OSM_STATUS_NEW}
                        neutral={status === OSM_STATUS_CHANGED}
                    >
                        {`${label}: ${counts[status] ?? 0}`}
                    </Tag>
                ))}
            </div>
            {features.length > 0 && (
                <DataTable scrollHeight="300px" layout="fixed">
                    <DataTableHead>
                        <DataTableRow>
                            <DataTableColumnHeader fixed top="0">
                                {i18n.t('Name')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader fixed top="0">
                                {i18n.t('Type')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader fixed top="0">
                                {i18n.t('OSM id')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader fixed top="0">
                                {i18n.t('Status')}
                            </DataTableColumnHeader>
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {features
                            .slice(0, MAX_PREVIEW_ROWS)
                            .map(({ osmId, name, type, status }) => (
                                <DataTableRow key={osmId}>
                                    <DataTableCell>{name}</DataTableCell>
                                    <DataTableCell>{type}</DataTableCell>
                                    <DataTableCell>{osmId}</DataTableCell>
                                    <DataTableCell>
                                        {labels[status]}
                                    </DataTableCell>
                                </DataTableRow>
                            ))}
                    </DataTableBody>
                </DataTable>
            )}
            {features.length > MAX_PREVIEW_ROWS && (
                <div className={styles.note}>
                    {i18n.t('Showing the first {{count}} features.', {
                        count: MAX_PREVIEW_ROWS,
                    })}
                </div>
            )}
        </div>
    )
}

PreviewStep.propTypes = {
    category: PropTypes.object.isRequired,
    features: PropTypes.array.isRequired,
    orgUnit: PropTypes.object.isRequired,
}

export const DoneStep = ({ stats }) => (
    <div className={styles.step}>
        <p>
            {i18n.t(
                'Import done. {{created}} created, {{updated}} updated, {{ignored}} ignored.',
                stats
            )}
        </p>
    </div>
)

DoneStep.propTypes = {
    stats: PropTypes.object.isRequired,
}
