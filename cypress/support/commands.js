import '@dhis2/cypress-commands'
import 'cypress-wait-until'
import { EXTENDED_TIMEOUT } from './util.js'

Cypress.Commands.add('getByDataTest', (selector, ...args) =>
    cy.get(`[data-test="${selector}"]`, ...args)
)

Cypress.Commands.add('waitForMap', (options = {}) => {
    const timeout = options.timeout ?? EXTENDED_TIMEOUT.timeout

    cy.get('body', { timeout }).should(() => {
        const mask = document.querySelector(
            '#dhis2-map-container .dhis2-map-loading-mask'
        )
        expect(mask, 'map loading mask should not be present').to.be.null

        const maps = document.querySelectorAll('.dhis2-map')
        expect(
            maps.length,
            'at least one .dhis2-map element should exist'
        ).to.be.greaterThan(0)
        maps.forEach((el) => {
            expect(
                el.classList.contains('dhis2-map-rendered'),
                'every .dhis2-map element should be rendered'
            ).to.equal(true)
        })
    })
})
Cypress.Commands.add(
    'findByDataTest',
    {
        prevSubject: true,
    },
    (subject, selector, ...args) =>
        cy.wrap(subject).find(`[data-test="${selector}"]`, ...args)
)

Cypress.Commands.add(
    'containsExact',
    {
        prevSubject: 'optional',
    },
    (subject, selector) =>
        cy
            .wrap(subject)
            .contains(
                new RegExp(
                    `^${selector.replace(
                        /[-/\\^$*+?.()|[\]{}]/g,
                        String.raw`\$&`
                    )}$`,
                    'gm'
                )
            )
)
