import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useProgramTrackedEntityAttributes } from '../../hooks/useProgramTrackedEntityAttributes.js'
import { combineDataItems } from '../../util/analytics.js'
import { useAppData } from '../app/AppDataProvider.js'
import { SelectField } from '../core/index.js'

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
        params: ({ id, nameProperty }) => ({
            program: id,
            fields: [
                'dimensionItem~rename(id)',
                `${nameProperty}~rename(name)`,
                'valueType',
            ],
            paging: false,
        }),
    },
}

const EventDataItemSelect = ({
    dataItem,
    program,
    onChange,
    className,
    errorText,
}) => {
    const { nameProperty } = useAppData()
    const { programAttributes } = useProgramTrackedEntityAttributes({
        programId: program?.id,
    })
    const { data, refetch: refetchProgramDataElements } = useDataQuery(
        PROGRAM_DATA_ELEMENTS_QUERY,
        {
            lazy: true,
        }
    )

    useEffect(() => {
        if (program) {
            refetchProgramDataElements({ id: program.id, nameProperty })
        }
    }, [program, refetchProgramDataElements, nameProperty])

    const dataItems = combineDataItems(
        programAttributes || [],
        data?.programDataElements.programDataElements || [],
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
