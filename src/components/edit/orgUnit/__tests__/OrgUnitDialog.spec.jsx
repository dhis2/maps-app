import { render, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import OrgUnitDialog from '../OrgUnitDialog.jsx'

jest.mock('../../../orgunits/OrgUnitSelect.jsx', () => {
    const OrgUnitSelectMock = () => <div data-test="orgunitselect-mock" />
    OrgUnitSelectMock.displayName = 'OrgUnitSelectMock'
    return OrgUnitSelectMock
})

jest.mock('../../../groupSet/StyleByGroupSet.jsx', () => {
    const StyleByGroupSetMock = () => <div data-test="stylebygroupset-mock" />
    StyleByGroupSetMock.displayName = 'StyleByGroupSetMock'
    return StyleByGroupSetMock
})

jest.mock('../../shared/Labels.jsx', () => {
    const LabelsMock = () => <div data-test="labels-mock" />
    LabelsMock.displayName = 'LabelsMock'
    return LabelsMock
})

const mockStore = configureMockStore()

const renderDialog = (props) => {
    const store = mockStore({ layerEdit: {} })
    return render(
        <Provider store={store}>
            <OrgUnitDialog
                validateLayer={false}
                onLayerValidation={jest.fn()}
                rows={[]}
                {...props}
            />
        </Provider>
    )
}

describe('OrgUnitDialog — hideStyleTab', () => {
    test('shows the Style tab by default (a real org unit layer)', () => {
        renderDialog()
        expect(screen.getByText('Style')).toBeInTheDocument()
    })

    test('omits the Style tab entirely when hideStyleTab is set (the Combined reference layer)', () => {
        renderDialog({ hideStyleTab: true })
        expect(screen.queryByText('Style')).not.toBeInTheDocument()
    })

    test('still shows the Organisation Units tab and its content when hideStyleTab is set', () => {
        renderDialog({ hideStyleTab: true })
        expect(screen.getByText('Organisation Units')).toBeInTheDocument()
        expect(screen.getByTestId('orgunitselect-mock')).toBeInTheDocument()
    })
})
