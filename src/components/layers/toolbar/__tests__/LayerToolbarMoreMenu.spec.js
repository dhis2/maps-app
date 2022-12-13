import { shallow } from 'enzyme'
import React from 'react'
import { LayerToolbarMoreMenu } from '../LayerToolbarMoreMenu.js'

describe('LayerToolbarMoreMenu', () => {
    it('Should render nothing when no props passed', () => {
        const wrapper = shallow(<LayerToolbarMoreMenu />)
        expect(wrapper.equals(null)).toBe(true)
    })

    it('Should open menu on click', () => {
        const wrapper = shallow(<LayerToolbarMoreMenu onRemove={() => null} />)

        expect(wrapper.find('Menu').length).toBe(0)

        wrapper.find('[data-test="moremenubutton"]').simulate('click')

        expect(wrapper.find('Menu').length).toBe(1)
    })

    it('Should render a single MenuItem with no divider if the only prop is onRemove', () => {
        const wrapper = shallow(<LayerToolbarMoreMenu onRemove={() => null} />)

        wrapper.find('[data-test="moremenubutton"]').simulate('click')

        expect(wrapper.find('MenuItem').length).toBe(1)
        expect(wrapper.find('Divider').length).toBe(0)
    })

    it('Should render two MenuItems with no divider if only passed onEdit and onRemove', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu onEdit={() => null} onRemove={() => null} />
        )

        wrapper.find('[data-test="moremenubutton"]').simulate('click')

        expect(wrapper.find('MenuItem').length).toBe(2)
        expect(wrapper.find('Divider').length).toBe(0)
    })

    it('Should render two MenuItems with no divider if only passed toggleDataTable', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu toggleDataTable={() => null} />
        )

        wrapper.find('[data-test="moremenubutton"]').simulate('click')

        expect(wrapper.find('MenuItem').length).toBe(1)
        expect(wrapper.find('Divider').length).toBe(0)
    })

    it('Should render two MenuItems with no divider if only passed toggleDataTable and downloadData', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu
                toggleDataTable={() => null}
                downloadData={() => null}
            />
        )

        wrapper.find('[data-test="moremenubutton"]').simulate('click')

        expect(wrapper.find('MenuItem').length).toBe(2)
        expect(wrapper.find('Divider').length).toBe(0)
    })

    it('Should render three MenuItems WITH divider if passed toggleDataTable, onEdit, and onRemove', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu
                onEdit={() => null}
                onRemove={() => null}
                toggleDataTable={() => null}
            />
        )

        wrapper.find('[data-test="moremenubutton"]').simulate('click')

        expect(wrapper.find('MenuItem').length).toBe(3)
        expect(wrapper.find('Divider').length).toBe(1)
    })

    it('Should render four MenuItems WITH divider if passed toggleDataTable, downloadData, onEdit, and onRemove', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu
                onEdit={() => null}
                onRemove={() => null}
                downloadData={() => null}
                toggleDataTable={() => null}
            />
        )

        wrapper.find('[data-test="moremenubutton"]').simulate('click')

        expect(wrapper.find('MenuItem').length).toBe(4)
        expect(wrapper.find('Divider').length).toBe(1)
    })

    it('Should match snapshot', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu
                onEdit={() => null}
                onRemove={() => null}
                downloadData={() => null}
                toggleDataTable={() => null}
            />
        )

        wrapper.find('[data-test="moremenubutton"]').simulate('click')

        expect(wrapper).toMatchSnapshot()
    })

    it('Should respond to click events properly for MenuItems - toggleDataTable, downloadData, onEdit, and onRemove', () => {
        const onEdit = jest.fn(),
            onRemove = jest.fn(),
            toggleDataTable = jest.fn(),
            downloadData = jest.fn()

        const wrapper = shallow(
            <LayerToolbarMoreMenu
                onEdit={onEdit}
                onRemove={onRemove}
                downloadData={downloadData}
                toggleDataTable={toggleDataTable}
            />
        )

        wrapper.find('[data-test="moremenubutton"]').simulate('click')

        const menuItems = wrapper.find('MenuItem')

        menuItems.at(0).simulate('click')
        expect(toggleDataTable).toHaveBeenCalledTimes(1)
        expect(downloadData).toHaveBeenCalledTimes(0)
        expect(onEdit).toHaveBeenCalledTimes(0)
        expect(onRemove).toHaveBeenCalledTimes(0)

        menuItems.at(1).simulate('click')
        expect(toggleDataTable).toHaveBeenCalledTimes(1)
        expect(downloadData).toHaveBeenCalledTimes(1)
        expect(onEdit).toHaveBeenCalledTimes(0)
        expect(onRemove).toHaveBeenCalledTimes(0)

        menuItems.at(2).simulate('click')
        expect(toggleDataTable).toHaveBeenCalledTimes(1)
        expect(downloadData).toHaveBeenCalledTimes(1)
        expect(onEdit).toHaveBeenCalledTimes(1)
        expect(onRemove).toHaveBeenCalledTimes(0)

        menuItems.at(3).simulate('click')
        expect(toggleDataTable).toHaveBeenCalledTimes(1)
        expect(downloadData).toHaveBeenCalledTimes(1)
        expect(onEdit).toHaveBeenCalledTimes(1)
        expect(onRemove).toHaveBeenCalledTimes(1)
    })
})
