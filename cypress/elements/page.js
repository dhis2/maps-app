import { EXTENDED_TIMEOUT } from '../support/extendedTimeout';

export class Page {
    openMap(name) {
        cy.get('button')
            .contains('File')
            .click();

        cy.get('li')
            .contains('Open')
            .click();

        cy.get('input[type="search"]').type(name);

        cy.contains(name, EXTENDED_TIMEOUT).click();

        return this;
    }

    validateMapMatchesSnapshot() {
        cy.waitForResources();
        cy.get('[data-test="map-loading-indicator"]').should('not.exist');
        // cy.get('canvas').toMatchImageSnapshot({
        //     imageConfig: {
        //         createDiffImage: true,
        //     },
        // });
        cy.get('canvas').matchImageSnapshot({
            failureThreshold: 0.1, // threshold for entire image
            // failureThresholdType: 'percent', // percent of image or number of pixels
            // customDiffConfig: { threshold: 0.1 }, // threshold for each pixel
        });
    }
}
