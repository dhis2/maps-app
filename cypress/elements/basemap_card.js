import { EXTENDED_TIMEOUT } from '../support/util.js'

const cardIsVisible = () =>
    cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT).should('be.visible')

const listHasLength = (length) =>
    cy
        .getByDataTest('list', EXTENDED_TIMEOUT)
        .children()
        .should('have.length', length)

const isInList = (basemapName) =>
    cy.getByDataTest('listitem-name').contains(basemapName).should('be.visible')

const activeBasemap = (basemapName) => {
    cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT)
        .find('h2')
        .contains(basemapName)
        .should('be.visible')

    cy.getByDataTest('basemaplistitem-name')
        .contains(basemapName)
        .scrollIntoView()

    cy.getByDataTest('basemaplistitem-name')
        .contains(basemapName)
        .siblings('[data-test=basemaplistitem-img]')
        .should('have.css', 'outline', 'rgb(21, 101, 192) solid 3px') // TODO - could remove the actual attribute value
}

const isNotVisible = () => {
    cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT)
        .find('[data-test=visibilitybutton]')
        .should('have.class', 'notvisible')
}

const isVisible = () => {
    cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT)
        .find('[data-test=visibilitybutton]')
        .should('have.class', 'visible')
}

export const checkBasemap = {
    isVisible,
    isNotVisible,
    activeBasemap,
    isInList,
    listHasLength,
    cardIsVisible,
}
