import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { combineDataItems } from '../../util/analytics.js'
import { getValidDataItems } from '../../util/helpers.js'
import { SelectField } from '../core/index.js'
import { useUserSettings } from '../UserSettingsProvider.js'

const excludeValueTypes = [
    'FILE_RESOURCE',
    'ORGANISATION_UNIT',
    'COORDINATE',
    'DATE',
    'TEXT',
    'BOOLEAN',
    'LONG_TEXT',
]

const PROGRAM_DATA_ELEMENTS_QUERY = {
    programDataElements: {
        resource: 'programDataElements',
        params: ({ id, nameProperty }) => {
            return {
                program: id,
                fields: [
                    'dimensionItem~rename(id)',
                    `${nameProperty}~rename(name)`,
                    'valueType',
                ],
                paging: false,
            }
        },
    },
}

const PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY = {
    trackedEntityAttributes: {
        resource: 'programs',
        id: ({ id }) => id,
        params: ({ nameProperty }) => {
            return {
                fields: [
                    `programTrackedEntityAttributes[trackedEntityAttribute[id,${nameProperty}~rename(name),valueType]]`,
                ],
                paging: false,
            }
        },
    },
}

const EventDataItemSelect = ({
    dataItem,
    program,
    onChange,
    className,
    errorText,
}) => {
    const { nameProperty } = useUserSettings()
    const [programAttributes, setProgramAttributes] = useState({})
    const [dataElements, setDataElements] = useState({})
    const { refetch: refetchProgramDataElements } = useDataQuery(
        PROGRAM_DATA_ELEMENTS_QUERY,
        {
            lazy: true,
            onComplete: (data) => {
                setDataElements({
                    ...dataElements,
                    [program.id]: data.programDataElements.programDataElements,
                })
            },
        }
    )

    const { refetch: refetchProgramTEAttributes } = useDataQuery(
        PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY,
        {
            lazy: true,
            onComplete: (data) => {
                const attributes =
                    data.trackedEntityAttributes.programTrackedEntityAttributes.map(
                        (attr) => attr.trackedEntityAttribute
                    )

                setProgramAttributes({
                    ...programAttributes,
                    [program.id]: getValidDataItems(attributes),
                })
            },
        }
    )

    useEffect(() => {
        if (program) {
            if (!dataElements[program.id]) {
                refetchProgramDataElements({ id: program.id, nameProperty })
            }

            if (!programAttributes[program.id]) {
                refetchProgramTEAttributes({
                    id: program.id,
                    nameProperty,
                })
            }
        }
    }, [
        program,
        programAttributes,
        dataElements,
        refetchProgramDataElements,
        refetchProgramTEAttributes,
        nameProperty,
    ])

    const dataItems = combineDataItems(
        programAttributes[program.id],
        dataElements[program.id],
        null,
        excludeValueTypes
    ).map((item) => ({
        ...item,
        id: !item.id.includes('.') ? `${program.id}.${item.id}` : item.id, // Add program id to tracked entity attributes
    }))

    return (
        <SelectField
            label={i18n.t('Event data item')}
            items={dataItems}
            value={dataItem ? dataItem.id : null}
            onChange={(dataItem) => onChange(dataItem, 'eventDataItem')}
            className={className}
            errorText={!dataItem && errorText ? errorText : null}
        />
    )
}

EventDataItemSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    dataItem: PropTypes.object,
    errorText: PropTypes.string,
    program: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default EventDataItemSelect
