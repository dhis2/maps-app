import { FacilityLayer } from '../elements/facility_layer.js'
import { ThematicLayer } from '../elements/thematic_layer.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

const map = {
    id: 'eDlFx0jTtV9',
    name: 'ANC: LLITN Cov Chiefdom this year',
    downloadFileNamePrefix: 'ANC LLITN Cov Chiefdom this year',
    cardTitle: 'ANC LLITN coverage',
    cardSelector: 'card-ANCLLITNcoverage',
}

describe('ui', () => {
    it('collapses and expands the Layers Panel', () => {
        cy.visit(`/#/${map.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        // check that Layers Panel is visible
        cy.getByDataTest('add-layer-button').should('be.visible')
        cy.getByDataTest('layers-panel').should('be.visible')
        cy.getByDataTest(map.cardSelector).should('be.visible')

        // collapse Layers Panel
        cy.getByDataTest('layers-toggle-button').click()

        // check that Layers Panel is not visible
        cy.getByDataTest('add-layer-button').should('be.visible') // this button is always visible
        // should have class collapsed
        cy.getByDataTest('layers-panel').should('not.be.visible')
        cy.getByDataTest('layers-panel').should('have.css', 'width', '0px')
        cy.getByDataTest(map.cardSelector).should('not.exist')

        // expand Layers Panel
        cy.getByDataTest('layers-toggle-button').click()

        // check that Layers Panel is visible
        cy.getByDataTest('add-layer-button').should('be.visible')
        cy.getByDataTest('layers-panel').should('be.visible')
        cy.getByDataTest(map.cardSelector).should('be.visible')
    })

    it('sets css user-select: none on document.body when dragging (sorting) a layer', () => {
        cy.visit('/')
        cy.get('canvas').should('be.visible')

        // 1. Create a map and add a thematic layer and a facility layer
        const ThemLayer = new ThematicLayer()
        const FacLayer = new FacilityLayer()
        // Add thematic layer
        ThemLayer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator('VCCT post-test counselling rate')
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
            .addToMap()

        // Add facility layer
        FacLayer.openDialog('Facilities')
            .selectTab('Organisation Units')
            .selectOu('Bo')
            .selectOuLevel('Facility')
            .addToMap()

        cy.document().should((doc) => {
            const userSelect = getComputedStyle(doc.body).userSelect
            expect(userSelect).not.to.eq('none')
        })
        // 2. Start dragging one of the layers
        // eslint-disable-next-line cypress/unsafe-to-chain-command
        cy.getByDataTest('sortable-handle')
            .first()
            .trigger('mousedown', { button: 0, force: true })
            .trigger('mousemove', { clientY: 100, force: true })

        // 3. Check that document.body has style user-select: none
        cy.document().should((doc) => {
            const userSelect = getComputedStyle(doc.body).userSelect
            expect(userSelect).to.eq('none')
        })

        // 4. End the drag (mouseup)
        cy.getByDataTest('sortable-handle')
            .first()
            .trigger('mouseup', { force: true })

        // Wait for the timeout in onSortEnd (100ms)
        cy.wait(150) // eslint-disable-line cypress/no-unnecessary-waiting

        cy.document().should((doc) => {
            const userSelect = getComputedStyle(doc.body).userSelect
            expect(userSelect).not.to.eq('none')
        })
    })
})
