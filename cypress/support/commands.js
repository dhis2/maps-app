import '@dhis2/cypress-commands'
import 'cypress-wait-until'
import { EXTENDED_TIMEOUT } from './util.js'

// Queries rather than commands: a chain after them (.find, .contains, .should)
// is retried from the start, so it survives the app re-rendering the element
Cypress.Commands.addQuery('getByDataTest', function (selector, options = {}) {
    if (options.timeout !== undefined) {
        this.set('timeout', options.timeout)
    }
    const getFn = cy.now('get', `[data-test="${selector}"]`, options)
    return () => getFn()
})

Cypress.Commands.addQuery('findByDataTest', function (selector, options = {}) {
    if (options.timeout !== undefined) {
        this.set('timeout', options.timeout)
    }
    const findFn = cy.now('find', `[data-test="${selector}"]`, options)
    return (subject) => findFn(subject)
})

Cypress.Commands.add('waitForMap', (options = {}) => {
    const timeout = options.timeout ?? EXTENDED_TIMEOUT.timeout

    cy.get('#dhis2-map-container', { timeout }).should(($container) => {
        const container = $container[0]

        const mask = container.querySelector('.dhis2-map-loading-mask')
        expect(mask, 'map loading mask should not be present').to.be.null

        const maps = container.querySelectorAll('.dhis2-map')
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
