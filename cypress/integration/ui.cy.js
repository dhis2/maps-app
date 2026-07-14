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

// Creates a map with a thematic layer and a facility layer, so the Layers
// panel shows two draggable overlay cards to reorder.
const addThematicAndFacilityLayers = () => {
    cy.visit('/')
    cy.get('canvas').should('be.visible')

    const ThemLayer = new ThematicLayer()
    const FacLayer = new FacilityLayer()

    // Add thematic layer
    ThemLayer.openDialog('Thematic')
        .selectItemType('Indicators')
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

    cy.wait(1000) // eslint-disable-line cypress/no-unnecessary-waiting
}

// Reads the ordered list of overlay layer card titles in the Layers panel.
const getOverlayLayerTitles = () =>
    cy
        .getByDataTest('sortable-layers-list')
        .find('[data-test="layercard"] h2')
        .then(($titles) => [...$titles].map((el) => el.textContent))

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
        addThematicAndFacilityLayers()

        cy.document().should((doc) => {
            const userSelect = getComputedStyle(doc.body).userSelect
            expect(userSelect).not.to.eq('none')
        })

        // Start dragging one of the layers
        cy.getByDataTest('sortable-handle').first().realMouseDown()
        cy.getByDataTest('sortable-handle').first().realMouseMove(0, 40)

        // Check that document.body has style user-select: none
        cy.document().should((doc) => {
            const userSelect = getComputedStyle(doc.body).userSelect
            expect(userSelect).to.eq('none')
        })

        // End the drag
        cy.getByDataTest('sortable-handle').first().realMouseUp()

        cy.document().should((doc) => {
            const userSelect = getComputedStyle(doc.body).userSelect
            expect(userSelect).not.to.eq('none')
        })
    })

    it('reorders overlay layers when a layer is dragged', () => {
        addThematicAndFacilityLayers()

        // Capture the initial top-to-bottom order of the overlay layer cards
        let initialTitles
        getOverlayLayerTitles().then((titles) => {
            expect(titles.length).to.be.greaterThan(1)
            initialTitles = titles
        })

        // Pick up the top layer's handle (Space), move it down one position
        // (ArrowDown), and drop it (Space)
        cy.getByDataTest('sortable-handle').first().focus()
        cy.realPress('Space')
        cy.realPress('ArrowDown')
        cy.realPress('Space')

        cy.getByDataTest('sortable-layers-list')
            .find('[data-test="layercard"] h2')
            .should(($titles) => {
                const titles = [...$titles].map((el) => el.textContent)
                expect(titles[0]).to.eq(initialTitles[1])
                expect(titles[1]).to.eq(initialTitles[0])
            })
    })
})
