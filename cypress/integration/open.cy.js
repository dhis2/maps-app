import { Page } from '../elements/page';

context('Open a map', () => {
    const MapPage = new Page();

    it('displays the map correctly', () => {
        cy.visit('/');

        MapPage.openMap(
            'Inpatient: BMI at facility level this year'
        ).validateMapMatchesSnapshot();
    });
});
