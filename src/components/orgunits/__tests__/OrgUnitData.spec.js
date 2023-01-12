import { render } from '@testing-library/react'
import React from 'react'
import OrgUnitData from '../OrgUnitData.js'

/* eslint-disable react/prop-types */
jest.mock('@dhis2/ui', () => {
    const originalModule = jest.requireActual('@dhis2/ui')

    return {
        __esModule: true,
        ...originalModule,
        SingleSelectField: function Mock(props) {
            return <div className="ui-SingleSelectField">{props.children}</div>
        },
        SingleSelectOption: function Mock(props) {
            return <div className="ui-SingleSelectOption">{props.children}</div>
        },
        Tooltip: function Mock(props) {
            return <div className="ui-Tooltip">{props.children}</div>
        },
        Button: function Mock(props) {
            return <div className="ui-Button">{props.children}</div>
        },
    }
})
/* eslint-enable react/prop-types */

const defaultProps = {
    id: 'DiszpKrYNg8',
    periodType: 'YEARLY',
    defaultPeriod: {
        id: '2021',
    },
}

const defaultItems = [
    {
        id: 'WUg3MYWQ7pt',
        label: 'Total Population',
        value: 3503,
    },
    {
        id: 'DTVRnCGamkV',
        label: 'Total population < 1 year',
        value: 140,
    },
    {
        id: 'vg6pdjObxsm',
        label: 'Population of women of child bearing age (WRA)',
        value: 716,
    },
    {
        id: 'Uvn6LCg7dVU',
        label: 'ANC 1 Coverage',
        value: 368.2,
    },
    {
        id: 'eTDtyyaSA7f',
        label: 'FIC <1y',
        value: 291.4,
    },
]

describe('Org unit data items', () => {
    it('renders with the default period and items', () => {
        const { container } = render(
            <OrgUnitData {...defaultProps} defaultItems={defaultItems} />
        )
        expect(container).toMatchSnapshot()
    })
})
