import { Page } from '../elements/page';
import { Layer } from '../elements/layer';

context('Open a map', () => {
    const MapPage = new Page();
    const MapLayer = new Layer();

    it('displays the map correctly', () => {
        cy.visit('/');

        MapPage.openMap(
            'Inpatient: BMI female under 5 at chiefdom level this year'
        ).validateMapMatchesSnapshot();

        MapLayer.validateCardTitle('BMI');
        MapLayer.validateCardItems([
            '38.4 - 56 (112)',
            '56 - 62.8 (124)',
            '62.8 - 68.7 (115)',
            '68.7 - 75.9 (129)',
            '75.9 - 115.6 (121)',
        ]);
    });
});
