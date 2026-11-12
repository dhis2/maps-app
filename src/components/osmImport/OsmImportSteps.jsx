import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Checkbox,
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
import { FLAG_GAP, FLAG_SNAPPED } from '../../util/orgUnitAssignment.js'
import {
    OSM_STATUS_CHANGED,
    OSM_STATUS_CONFLICT,
    OSM_STATUS_NEW,
    OSM_STATUS_REASSIGNED,
    OSM_STATUS_REMOVED,
    OSM_STATUS_UNCHANGED,
} from '../../util/osm.js'
import {
    getSubcategoryIds,
    OSM_GEOMETRY_LINE,
    OSM_GEOMETRY_POINT,
} from '../../util/osmCategories.js'
import { getOrgUnitsLabel } from './osmLayer.js'
import styles from './styles/OsmImport.module.css'

const MAX_PREVIEW_ROWS = 100

const getStatusLabels = () => ({
    [OSM_STATUS_NEW]: i18n.t('New'),
    [OSM_STATUS_CHANGED]: i18n.t('Changed'),
    [OSM_STATUS_REASSIGNED]: i18n.t('Moved to another org unit'),
    [OSM_STATUS_REMOVED]: i18n.t('No longer in OSM'),
    [OSM_STATUS_UNCHANGED]: i18n.t('Unchanged'),
    [OSM_STATUS_CONFLICT]: i18n.t('Conflict'),
})

const countBy = (list, getKey) =>
    list.reduce((acc, item) => {
        const key = getKey(item)
        acc[key] = (acc[key] ?? 0) + 1
        return acc
    }, {})

const getOrgUnitNames = (orgUnits) =>
    orgUnits.map(({ name }) => name).join(', ')

export const SetupStep = ({ category, canSetup }) => (
    <div className={styles.step}>
        <p>
            {i18n.t(
                'OSM data is stored as events, one program per category. The program for {{- category}} is missing on this server or needs new data elements. It will be created or updated, with its program stage and the shared OSM data elements.',
                { category: category.name.toLowerCase() }
            )}
        </p>
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
    category: PropTypes.object.isRequired,
}

const getGeometryGroups = () => [
    { geometry: OSM_GEOMETRY_POINT, name: i18n.t('Points') },
    { geometry: OSM_GEOMETRY_LINE, name: i18n.t('Lines') },
]

const Subcategories = ({
    category,
    subcategoryIds,
    counts,
    isCounting,
    canCount,
    onChange,
    onCount,
}) => {
    const toggle = (id, checked) =>
        onChange(
            checked
                ? getSubcategoryIds(category).filter(
                      (sub) => sub === id || subcategoryIds.includes(sub)
                  )
                : subcategoryIds.filter((sub) => sub !== id)
        )

    return (
        <div className={styles.subcategories}>
            {category.subcategories.map(({ id, name, values }) => (
                <div key={id} className={styles.subcategory}>
                    <Checkbox
                        dense
                        label={
                            counts ? `${name} (${counts.get(id) ?? 0})` : name
                        }
                        checked={subcategoryIds.includes(id)}
                        onChange={({ checked }) => toggle(id, checked)}
                    />
                    <div className={styles.values}>{values.join(', ')}</div>
                </div>
            ))}
            <div className={styles.count}>
                <Button
                    small
                    loading={isCounting}
                    disabled={!canCount}
                    onClick={onCount}
                >
                    {i18n.t('Count in area')}
                </Button>
                {counts && (
                    <span className={styles.note}>
                        {i18n.t(
                            'In the bounding box of the area, so slightly more than imported.'
                        )}
                    </span>
                )}
            </div>
        </div>
    )
}

Subcategories.propTypes = {
    canCount: PropTypes.bool.isRequired,
    category: PropTypes.object.isRequired,
    isCounting: PropTypes.bool.isRequired,
    subcategoryIds: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onCount: PropTypes.func.isRequired,
    counts: PropTypes.object,
}

export const SelectStep = ({
    categories,
    category,
    subcategoryIds,
    counts,
    isCounting,
    orgUnits,
    roots,
    onCategoryChange,
    onSubcategoriesChange,
    onCount,
    onOrgUnitChange,
}) => (
    <div className={styles.select}>
        <div className={styles.column}>
            {getGeometryGroups().map(({ geometry, name }) => (
                <div key={geometry}>
                    <h3 className={styles.heading}>{name}</h3>
                    {categories
                        .filter((c) => c.geometry === geometry)
                        .map(({ id, name }) => (
                            <div key={id}>
                                <Radio
                                    dense
                                    label={name}
                                    value={id}
                                    checked={category?.id === id}
                                    onChange={() => onCategoryChange(id)}
                                />
                                {category?.id === id && (
                                    <Subcategories
                                        category={category}
                                        subcategoryIds={subcategoryIds}
                                        counts={counts}
                                        isCounting={isCounting}
                                        canCount={orgUnits.length > 0}
                                        onChange={onSubcategoriesChange}
                                        onCount={onCount}
                                    />
                                )}
                            </div>
                        ))}
                </div>
            ))}
        </div>
        <div className={styles.column}>
            <h3 className={styles.heading}>{i18n.t('Areas')}</h3>
            <div className={styles.tree}>
                <OrganisationUnitTree
                    roots={roots}
                    selected={orgUnits.map(({ path }) => path)}
                    onChange={onOrgUnitChange}
                />
            </div>
            {orgUnits.length > 0 && (
                <div className={styles.note}>{getOrgUnitsLabel(orgUnits)}</div>
            )}
        </div>
    </div>
)

SelectStep.propTypes = {
    categories: PropTypes.array.isRequired,
    isCounting: PropTypes.bool.isRequired,
    roots: PropTypes.array.isRequired,
    subcategoryIds: PropTypes.array.isRequired,
    onCategoryChange: PropTypes.func.isRequired,
    onCount: PropTypes.func.isRequired,
    onOrgUnitChange: PropTypes.func.isRequired,
    onSubcategoriesChange: PropTypes.func.isRequired,
    category: PropTypes.object,
    counts: PropTypes.object,
    orgUnits: PropTypes.array,
}

export const PreviewStep = ({
    category,
    orgUnits,
    plan,
    deleteRemoved,
    onDeleteRemovedChange,
}) => {
    const { rows, removedDeletes, duplicates } = plan
    const labels = getStatusLabels()
    const counts = countBy(rows, ({ status }) => status)
    const found = rows.filter(({ status }) => status !== OSM_STATUS_REMOVED)
    const snapped = rows.filter(({ flags }) => flags.includes(FLAG_SNAPPED))
    const gaps = rows.filter(({ flags }) => flags.includes(FLAG_GAP))

    return (
        <div className={styles.step}>
            <p>
                {i18n.t(
                    '{{count}} features found in OpenStreetMap for {{- category}} in {{- orgUnit}}.',
                    {
                        count: found.length,
                        category: category.name,
                        orgUnit: getOrgUnitsLabel(orgUnits),
                    }
                )}
            </p>
            <div className={styles.counts}>
                {Object.entries(labels)
                    .filter(([status]) => counts[status])
                    .map(([status, label]) => (
                        <Tag
                            key={status}
                            positive={status === OSM_STATUS_NEW}
                            neutral={
                                status === OSM_STATUS_CHANGED ||
                                status === OSM_STATUS_REASSIGNED
                            }
                            negative={
                                status === OSM_STATUS_CONFLICT ||
                                status === OSM_STATUS_REMOVED
                            }
                        >
                            {`${label}: ${counts[status]}`}
                        </Tag>
                    ))}
            </div>
            {(snapped.length > 0 || gaps.length > 0 || duplicates > 0) && (
                <ul className={styles.notes}>
                    {gaps.length > 0 && (
                        <li>
                            {i18n.t(
                                '{{count}} features are outside the boundaries of the org units below theirs, so they stay at a higher level.',
                                { count: gaps.length }
                            )}
                        </li>
                    )}
                    {snapped.length > 0 && (
                        <li>
                            {i18n.t(
                                '{{count}} features are just outside a boundary and go to the nearest org unit.',
                                { count: snapped.length }
                            )}
                        </li>
                    )}
                    {duplicates > 0 && (
                        <li>
                            {i18n.t(
                                '{{count}} duplicate events will be deleted.',
                                { count: duplicates }
                            )}
                        </li>
                    )}
                </ul>
            )}
            {removedDeletes.length > 0 && (
                <Checkbox
                    dense
                    checked={deleteRemoved}
                    label={i18n.t(
                        'Delete the features no longer in OpenStreetMap ({{count}} events)',
                        { count: removedDeletes.length }
                    )}
                    onChange={({ checked }) => onDeleteRemovedChange(checked)}
                />
            )}
            {rows.length > 0 && (
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
                                {i18n.t('Org unit')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader fixed top="0">
                                {i18n.t('Edited by')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader fixed top="0">
                                {i18n.t('Status')}
                            </DataTableColumnHeader>
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {rows
                            .slice(0, MAX_PREVIEW_ROWS)
                            .map(
                                ({
                                    key,
                                    osmId,
                                    name,
                                    type,
                                    orgUnits,
                                    editedBy,
                                    status,
                                }) => (
                                    <DataTableRow key={key}>
                                        <DataTableCell>
                                            {name || osmId}
                                        </DataTableCell>
                                        <DataTableCell>{type}</DataTableCell>
                                        <DataTableCell>
                                            {getOrgUnitNames(orgUnits)}
                                        </DataTableCell>
                                        <DataTableCell>
                                            {editedBy}
                                        </DataTableCell>
                                        <DataTableCell>
                                            {labels[status]}
                                        </DataTableCell>
                                    </DataTableRow>
                                )
                            )}
                    </DataTableBody>
                </DataTable>
            )}
            {rows.length > MAX_PREVIEW_ROWS && (
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
    deleteRemoved: PropTypes.bool.isRequired,
    orgUnits: PropTypes.array.isRequired,
    plan: PropTypes.object.isRequired,
    onDeleteRemovedChange: PropTypes.func.isRequired,
}

export const DoneStep = ({ stats }) => (
    <div className={styles.step}>
        <p>
            {i18n.t(
                'Import done. {{created}} created, {{updated}} updated, {{deleted}} deleted, {{ignored}} ignored.',
                stats
            )}
        </p>
    </div>
)

DoneStep.propTypes = {
    stats: PropTypes.object.isRequired,
}
