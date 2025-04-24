import { EXTENDED_TIMEOUT } from '../support/util.js'

export const openMap = (mapName) => {
    cy.contains('File').click()
    cy.getByDataTest('file-menu-container').should('be.visible')

    cy.getByDataTest('file-menu-open').should('be.visible').click()

    cy.intercept({
        method: 'GET',
        url: /\/maps\?/,
    }).as('fetchListOfMaps')

    cy.getByDataTest('open-file-dialog-modal-name-filter').find('input').clear()

    cy.getByDataTest('open-file-dialog-modal-name-filter').find('input').focus()

    cy.getByDataTest('open-file-dialog-modal-name-filter')
        .find('input')
        .type(mapName)

    cy.wait('@fetchListOfMaps')

    cy.log(mapName)

    cy.getByDataTest('dhis2-uicore-datatable')
        .contains(mapName)
        .should('be.visible')
    cy.getByDataTest('dhis2-uicore-datatable').contains(mapName).click()

    // cy.get('[data-test="dhis2-uicore-layer"]').click('topLeft');
    // cy.wait(1000);

    cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

    cy.getByDataTest('open-file-dialog-modal').should('not.be.visible')
}

export const renameMap = (title, description) => {
    cy.contains('File').click()
    cy.getByDataTest('file-menu-container').should('be.visible')

    cy.getByDataTest('file-menu-rename').should('be.visible').click()

    if (title !== undefined) {
        cy.getByDataTest(
            'file-menu-rename-modal-name-content',
            EXTENDED_TIMEOUT
        )
            .find('input')
            .clear()

        cy.getByDataTest(
            'file-menu-rename-modal-name-content',
            EXTENDED_TIMEOUT
        )
            .find('input')
            .type(title)
    }

    if (description !== undefined) {
        cy.getByDataTest(
            'file-menu-rename-modal-description-content',
            EXTENDED_TIMEOUT
        )
            .find('textarea')
            .clear()

        cy.getByDataTest(
            'file-menu-rename-modal-description-content',
            EXTENDED_TIMEOUT
        )
            .find('textarea')
            .type(description)
    }

    cy.get('button').contains('Rename').click()

    cy.getByDataTest('file-menu-rename-modal').should('not.exist')
}

export const saveAsNewMap = (newMapName) => {
    cy.contains('File').click()
    cy.getByDataTest('file-menu-container').should('be.visible')

    cy.getByDataTest('file-menu-saveas').should('be.visible').click()

    cy.getByDataTest('file-menu-saveas-modal-name-content', EXTENDED_TIMEOUT)
        .find('input')
        .clear()

    cy.getByDataTest('file-menu-saveas-modal-name-content', EXTENDED_TIMEOUT)
        .find('input')
        .type(newMapName)

    cy.get('button').contains('Save').click()

    cy.getByDataTest('file-menu-saveas-modal').should('not.exist')
}

export const saveNewMap = (newMapName) => {
    cy.contains('File').click()
    cy.getByDataTest('file-menu-container').should('be.visible')

    cy.getByDataTest('file-menu-save').should('be.visible').click()

    cy.getByDataTest('file-menu-saveas-modal-name-content', EXTENDED_TIMEOUT)
        .find('input')
        .clear()

    cy.getByDataTest('file-menu-saveas-modal-name-content', EXTENDED_TIMEOUT)
        .find('input')
        .type(newMapName)

    cy.get('button').contains('Save').click()

    cy.getByDataTest('file-menu-saveas-modal').should('not.exist')
}

export const saveExistingMap = () => {
    cy.contains('File').click()
    cy.getByDataTest('file-menu-container').should('be.visible')

    cy.getByDataTest('file-menu-save').should('be.visible').click()
}

export const deleteMap = () => {
    cy.contains('File').click()
    cy.getByDataTest('file-menu-container', EXTENDED_TIMEOUT).should(
        'be.visible'
    )

    cy.getByDataTest('file-menu-delete', EXTENDED_TIMEOUT)
        .should('not.have.class', 'disabled')
        .should('be.visible')
        .click()

    cy.getByDataTest('file-menu-delete-modal').should('be.visible')

    cy.getByDataTest('file-menu-delete-modal-delete', EXTENDED_TIMEOUT).click()

    cy.getByDataTest('file-menu-delete-modal', EXTENDED_TIMEOUT).should(
        'not.exist'
    )
}
