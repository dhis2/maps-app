import { TeLayer } from '../../elements/te_layer.js'
import { EXTENDED_TIMEOUT } from '../../support/util.js'

describe('Tracked Entity Layers', () => {
    beforeEach(() => {
        cy.visit('/', EXTENDED_TIMEOUT)
    })

    const Layer = new TeLayer()

    it('adds a tracked entity layer', () => {
        Layer.openDialog('Tracked entities')
            .selectTab('Data')
            .selectTeType('Malaria Entity')
            .selectTeProgram(
                'Malaria case diagnosis, treatment and investigation'
            )
            .selectTab('Org Units')
            .selectOu('Bombali')
            .selectOu('Bo')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(
            'Malaria case diagnosis, treatment and investigation'
        )
        Layer.validateCardItems(['Malaria Entity'])
    })
})
