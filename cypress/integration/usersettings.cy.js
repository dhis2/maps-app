const USER_SETTINGS_ENDPOINT = { method: 'GET', url: 'userSettings?*' };

describe('userSettings', () => {
    beforeEach(() => {
        cy.intercept(USER_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue();
        });
    });

    it('shows the app in Spanish', () => {
        cy.intercept(USER_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                res.body.keyUiLocale = 'es';

                res.send({
                    body: res.body,
                });
            });
        });

        cy.visit('/?id=ZBjCfSaLSqD');

        cy.contains('Fichero').should('be.visible');
        cy.contains('File').should('not.exist');
        cy.contains('Descargar').should('be.visible');
        cy.contains('Download').should('not.exist');

        cy.contains('Interpretaciones').click();
        cy.get('div')
            .contains('John Kamara')
            .click();

        cy.contains('14 de may.').should('be.visible');
    });

    it('shows the app in English', () => {
        cy.visit('/?id=ZBjCfSaLSqD');

        cy.contains('Fichero').should('not.exist');
        cy.contains('File').should('be.visible');
        cy.contains('Descargar').should('not.exist');
        cy.contains('Download').should('be.visible');

        cy.contains('Interpretations').click();
        cy.get('div')
            .contains('John Kamara')
            .click();

        cy.contains('May 14').should('be.visible');
    });
});
