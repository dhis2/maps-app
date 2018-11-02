import React from 'react';
import { shallow } from 'enzyme';
import { DownloadDialog } from '../DownloadDialog';
// import { downloadSupport } from '../../../util/export-image';

// jest.mock('downloadSupport', () => true);

describe('DownloadDialog', () => {
    const renderComponent = props =>
        shallow(
            <DownloadDialog
                classes={{}}
                showDialog={false}
                showName={false}
                showLegend={false}
                legendPosition='bottomright'
                hasName={false}
                hasLegend={false}
                toggleDownloadDialog={() => null}
                toggleDownloadShowName={() => null}
                toggleDownloadShowLegend={() => null}
                setDownloadLegendPosition={() => null}
                {...props}
            />
        );

    it('Should render null when showDialog is false', () => {
        const wrapper = renderComponent();
        expect(wrapper.isEmptyRender()).toBe(true);
    });

    it('Should render a dialog when showDialog is true', () => {
        const wrapper = renderComponent({
            showDialog: true,
        });
        expect(wrapper.isEmptyRender()).toBe(false);
        expect(wrapper.find('WithStyles(Dialog)').length).toBe(1);
    });

    /*
    it('Should disable name checkbox if no name is set', () => {
        const wrapper = renderComponent({
            showDialog: true,
            hasName: false,
        });
        console.log(wrapper.debug());

        expect(
            wrapper
                .find('WithStyles(Checkbox)')
                .at(0)
                .prop('disabled')
        ).toBe(true);
    }); 
    */

});
