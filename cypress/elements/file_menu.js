export const openMap = mapName => {
    cy.contains('File').click();
    cy.getByDataTest('file-menu-container').should('be.visible');

    cy.getByDataTest('file-menu-open')
        .should('be.visible')
        .click();

    cy.getByDataTest('open-file-dialog-modal-name-filter')
        .find('input')
        .focus()
        .type(mapName);

    cy.getByDataTest('open-file-dialog-modal')
        .contains(mapName)
        .click();
};

export const saveAsNewMap = newMapName => {
    cy.contains('File').click();
    cy.getByDataTest('file-menu-container').should('be.visible');

    cy.getByDataTest('file-menu-saveas')
        .should('be.visible')
        .click();

    cy.getByDataTest('file-menu-saveas-modal-name-content')
        .find('input')
        .clear()
        .type(newMapName);

    cy.get('button')
        .contains('Save')
        .click();
};

export const saveNewMap = newMapName => {
    cy.contains('File').click();
    cy.getByDataTest('file-menu-container').should('be.visible');

    cy.getByDataTest('file-menu-save')
        .should('be.visible')
        .click();

    cy.getByDataTest('file-menu-saveas-modal-name-content')
        .find('input')
        .clear()
        .type(newMapName);

    cy.get('button')
        .contains('Save')
        .click();
};

export const saveExistingMap = () => {
    cy.contains('File').click();
    cy.getByDataTest('file-menu-container').should('be.visible');

    cy.getByDataTest('file-menu-save')
        .should('be.visible')
        .click();
};
