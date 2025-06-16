import { render, screen, fireEvent, within, act } from '@testing-library/react'
import React from 'react'
import SelectField from '../SelectField.jsx'

const items = [
    {
        id: 'cat',
        name: 'Cat',
    },
    {
        id: 'mouse',
        name: 'Mouse',
    },
    {
        id: 'dog',
        name: 'Dog',
    },
]

describe('SelectField', () => {
    it('should be a SingleSelectField by default', () => {
        render(<SelectField />)
        expect(
            screen.getByTestId('dhis2-uiwidgets-singleselectfield')
        ).toBeInTheDocument()
    })

    it('should be a MultipleSelectField if multiple is true', () => {
        render(<SelectField multiple={true} />)
        expect(
            screen.getByTestId('dhis2-uiwidgets-multiselectfield')
        ).toBeInTheDocument()
    })

    it('should display validation error', () => {
        render(<SelectField errorText="This is an emergency" />)
        const { getByText } = within(
            screen.getByTestId('dhis2-uiwidgets-singleselectfield-validation')
        )
        expect(getByText('This is an emergency')).toBeInTheDocument()
    })

    it('should pass label to SingleSelectField', () => {
        render(<SelectField label="My label" />)
        expect(screen.getByText('My label')).toBeInTheDocument()
    })

    it('should pass className to select field wrapper', () => {
        render(<SelectField className="myClass" />)
        expect(screen.getByTestId('select-field-container')).toHaveClass(
            'myClass'
        )
    })

    it('should render items array as SingleSelectOption', async () => {
        render(<SelectField items={items} label="The indicator" />)

        // click to open the select dropdown
        await act(async () => {
            // click to open the select dropdown
            await fireEvent.click(
                screen.getByTestId('dhis2-uicore-select-input')
            )
        })

        const options = screen.getAllByTestId('dhis2-uicore-singleselectoption')
        expect(options).toHaveLength(items.length)
        expect(options[0]).toHaveTextContent('Cat')
        expect(options[1]).toHaveTextContent('Mouse')
        expect(options[2]).toHaveTextContent('Dog')
    })

    it('should call onChange with item object when single select', async () => {
        const onChangeSpy = jest.fn()
        render(
            <SelectField
                items={items}
                label="The indicator"
                onChange={onChangeSpy}
            />
        )

        // click to open the select dropdown
        await act(async () => {
            // click to open the select dropdown
            await fireEvent.click(
                screen.getByTestId('dhis2-uicore-select-input')
            )
        })

        const options = screen.getAllByTestId('dhis2-uicore-singleselectoption')
        expect(options).toHaveLength(items.length)

        // click on the second option
        await act(async () => {
            // click on the second option
            await fireEvent.click(options[1])
        })

        expect(onChangeSpy).toHaveBeenCalledWith(items[1])
    })
})
