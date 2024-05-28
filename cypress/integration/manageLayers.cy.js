import { EXTENDED_TIMEOUT, getApiBaseUrl } from '../support/util.js'

const MAPS_ADMIN_AUTHORITY_ID = 'F_PROGRAM_TRACKED_ENTITY_ATTRIBUTE_GROUP_ADD'

context('Manage Layers', () => {
    beforeEach(() => {
        cy.visit('/', EXTENDED_TIMEOUT)
    })

    it('maps authority id is set', () => {
        cy.request({
            method: 'GET',
            url: `${getApiBaseUrl()}/api/me/authorization/${MAPS_ADMIN_AUTHORITY_ID}`,
            headers: {
                'Content-Type': 'text/plain',
            },
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.eq(true)
        })
    })

    it('check modal behavior', () => {
        cy.getByDataTest('add-layer-button').click()
        cy.getByDataTest('addlayerpopover').should('be.visible')
        cy.getByDataTest('managelayers-button').should('be.visible')
        cy.getByDataTest('managelayers-button').contains(
            'Manage available layers'
        )
        cy.getByDataTest('managelayers-button').click()
        cy.getByDataTest('addlayerpopover').should('not.exist')

        cy.getByDataTest('earthenginemodal').should('be.visible')
        cy.getByDataTest('earthenginemodal-title').should('be.visible')
        cy.getByDataTest('earthenginemodal-content').should('be.visible')
        cy.getByDataTest('earthenginelayer-checkbox')
            .its('length')
            .should('be.gte', 1)
        cy.getByDataTest('earthenginemodal-actions').should('be.visible')
        cy.getByDataTest('earthenginemodal-button')
            .contains('Close')
            .should('be.visible')
        cy.getByDataTest('earthenginemodal-button').click()
        cy.getByDataTest('earthenginemodal').should('not.exist')
    })

    it('add and remove layers', () => {
        Cypress.Commands.add(
            'waitForLayerContainers',
            (timeout = EXTENDED_TIMEOUT) => {
                cy.getByDataTest('addlayerpopover', timeout)
                    .find('[class^="Layer_container"]')
                    .should('have.length.greaterThan', numberOfLayers)
            }
        )
        Cypress.Commands.add(
            'waitForCheckbox',
            (index, assertion, timeout = EXTENDED_TIMEOUT) => {
                cy.getByDataTest('earthenginelayer-checkbox', timeout)
                    .eq(index)
                    .find('input')
                    .should(assertion)
            }
        )

        cy.log('count default layers (n)')
        let numberOfLayers
        cy.getByDataTest('add-layer-button').click()
        cy.getByDataTest('addlayerpopover')
            .find('[class^="Layer_container"]')
            .then((elements) => {
                numberOfLayers = elements.length
                cy.log(`${numberOfLayers} layers`)
            })

        cy.log('add one layer')
        cy.getByDataTest('managelayers-button').click()
        cy.getByDataTest('earthenginelayer-checkbox').eq(0).click()
        cy.getByDataTest('earthenginemodal-button').click()

        cy.log('check there is n+1 layers available')
        cy.getByDataTest('add-layer-button').click()
        cy.waitForLayerContainers().then((elements) => {
            cy.wrap(elements.length).should('equal', numberOfLayers + 1)
        })

        cy.log('verify the box of the layer is checked')
        cy.getByDataTest('managelayers-button').click()
        cy.waitForCheckbox(0, 'be.checked')

        cy.log('add one more layer')
        cy.getByDataTest('earthenginelayer-checkbox').eq(1).click()
        cy.getByDataTest('earthenginemodal-button').click()

        cy.log('check there is n+2 layers available')
        cy.getByDataTest('add-layer-button').click()
        cy.waitForLayerContainers().then((elements) => {
            cy.wrap(elements.length).should('equal', numberOfLayers + 2)
        })

        cy.log('verify the box of the layer is checked')
        cy.getByDataTest('managelayers-button').click()
        cy.waitForCheckbox(1, 'be.checked')

        cy.log('remove one layer')
        cy.getByDataTest('earthenginelayer-checkbox').eq(0).click()
        cy.getByDataTest('earthenginemodal-button').click()

        cy.log('check there is n+1 layers available')
        cy.getByDataTest('add-layer-button').click()
        cy.waitForLayerContainers().then((elements) => {
            cy.wrap(elements.length).should('equal', numberOfLayers + 1)
        })

        cy.log('verify the box of the layer is checked')
        cy.getByDataTest('managelayers-button').click()
        cy.waitForCheckbox(0, 'not.be.checked')
        cy.getByDataTest('earthenginemodal-button').click()
    })
})
