import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import ConfirmLeaveModal from '../ConfirmLeaveModal.jsx'

describe('ConfirmLeaveModal', () => {
    it('calls onCancel when the cancel button is clicked', () => {
        const onCancel = jest.fn()
        render(<ConfirmLeaveModal onCancel={onCancel} onConfirm={jest.fn()} />)

        fireEvent.click(screen.getByTestId('confirm-leave-modal-option-cancel'))

        expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onConfirm when the leave button is clicked', () => {
        const onConfirm = jest.fn()
        render(<ConfirmLeaveModal onCancel={jest.fn()} onConfirm={onConfirm} />)

        fireEvent.click(
            screen.getByTestId('confirm-leave-modal-option-confirm')
        )

        expect(onConfirm).toHaveBeenCalledTimes(1)
    })
})
