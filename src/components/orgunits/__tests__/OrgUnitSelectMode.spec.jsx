import { useConfig } from '@dhis2/app-runtime'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { useSelector } from 'react-redux'
import OrgUnitSelectMode from '../OrgUnitSelectMode.jsx'

jest.mock('@dhis2/app-runtime', () => ({ useConfig: jest.fn() }))
jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: () => jest.fn(),
}))
jest.mock('../../core/index.js', () => {
    const PropTypes = require('prop-types')
    const SelectField = ({ value }) => <span>{value}</span>
    SelectField.propTypes = { value: PropTypes.string }
    return { SelectField }
})

const renderMode = ({ mode, minor }) => {
    useConfig.mockReturnValue({ serverVersion: { minor } })
    useSelector.mockImplementation((selector) =>
        selector({ layerEdit: { organisationUnitSelectionMode: mode } })
    )
    render(<OrgUnitSelectMode />)
}

describe('OrgUnitSelectMode', () => {
    it.each([
        { minor: 40, expected: 'SELECTED' },
        { minor: 41, expected: 'DESCENDANTS' },
    ])('shows $expected by default on 2.$minor', ({ minor, expected }) => {
        renderMode({ mode: undefined, minor })

        expect(screen.getByText(expected)).toBeInTheDocument()
    })

    it('shows the mode of the layer', () => {
        renderMode({ mode: 'CHILDREN', minor: 43 })

        expect(screen.getByText('CHILDREN')).toBeInTheDocument()
    })
})
