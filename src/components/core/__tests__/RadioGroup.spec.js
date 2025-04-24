import { render, screen } from '@testing-library/react'
import React from 'react'
import { Radio, RadioGroup } from '../index.js'

/* eslint-disable react/prop-types */
jest.mock('@dhis2/ui', () => {
    const originalModule = jest.requireActual('@dhis2/ui')

    return {
        __esModule: true,
        ...originalModule,
        FieldGroup: function MockFieldGroup({ helpText, children }) {
            return (
                <div>
                    <div>{helpText}</div>
                    <div>{children}</div>
                </div>
            )
        },
    }
})
/* eslint-enable react/prop-types */

describe('RadioGroup', () => {
    const mockOnChange = jest.fn()

    const value = 'option1'
    const label = 'Select an option'
    const helpText = 'Choose one of the available options'
    const children = [
        <Radio value="option1" label="option1" key="option1" />,
        <Radio value="option2" label="option2" key="option2" />,
    ]
    let props

    beforeEach(() => {
        jest.clearAllMocks()
        props = {
            value,
            label,
            helpText,
            display: 'column',
            onChange: mockOnChange,
            boldLabel: true,
            children,
            dataTest: 'radio-group',
        }
    })

    it('renders the RadioGroup', () => {
        render(<RadioGroup {...props} />)
        const labelElement = screen.getByText(label)
        expect(labelElement).toBeInTheDocument()

        // Check if the helpText is rendered
        const helpTextElement = screen.getByText(helpText)
        expect(helpTextElement).toBeInTheDocument()

        // Check if the children (radio buttons) are rendered
        const radioButtons = screen.getAllByRole('radio')
        expect(radioButtons.length).toBe(children.length)
        expect(radioButtons[0]).toHaveAttribute('value', 'option1')
        expect(radioButtons[1]).toHaveAttribute('value', 'option2')
    })

    it('applies the correct class based on display prop', () => {
        render(<RadioGroup {...props} display="row" />)
        const topDiv = screen.getByTestId('radio-group')

        expect(topDiv).toHaveClass('row')
    })

    it('updates the radio state when value prop changes', async () => {
        const { rerender } = render(<RadioGroup {...props} />)

        // Check that the first radio button is initially checked
        const radioButtons = screen.getAllByRole('radio')
        expect(radioButtons[0]).toBeChecked()
        expect(radioButtons[1]).not.toBeChecked()

        // Update the value prop and re-render the component
        rerender(<RadioGroup {...props} value="option2" />)

        // Check that the second radio button is now checked
        expect(radioButtons[0]).not.toBeChecked()
        expect(radioButtons[1]).toBeChecked()
    })
})
