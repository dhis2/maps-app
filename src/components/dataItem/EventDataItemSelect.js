import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { combineDataItems } from '../../util/analytics.js'
import { SelectField } from '../core/index.js'
import { useProgramTrackedEntityAttributes } from '../useProgramTrackedEntityAttributes.js'
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

const EventDataItemSelect = ({
    dataItem,
    program,
    onChange,
    className,
    errorText,
}) => {
    const { nameProperty } = useUserSettings()
    const { programAttributes, setProgramIdForProgramAttributes } =
        useProgramTrackedEntityAttributes()
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

    useEffect(() => {
        if (program) {
            if (!dataElements[program.id]) {
                refetchProgramDataElements({ id: program.id, nameProperty })
            }

            setProgramIdForProgramAttributes(program.id)
        }
    }, [
        program,
        programAttributes,
        dataElements,
        refetchProgramDataElements,
        setProgramIdForProgramAttributes,
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
