import { checkBasemap } from '../elements/basemap_card.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

const SYSTEM_SETTINGS_ENDPOINT = { method: 'GET', url: /systemSettings\?/ }

describe('Basemap checks', () => {
    beforeEach(() => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue()
        })
    })

    it('open map with basemap = none uses default basemap set to not visible', () => {
        cy.intercept({ method: 'GET', url: /\/maps\/ytkZY3ChM6J/ }, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.basemap = 'none'
                res.send({ body: res.body })
            })
        }).as('openMap')

        cy.visit('/?id=ytkZY3ChM6J', EXTENDED_TIMEOUT)
        cy.wait('@openMap', EXTENDED_TIMEOUT)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        checkBasemap.cardIsVisible()
        checkBasemap.isNotVisible()
    })

    it('open map with basemap = object uses id from the object', () => {
        cy.intercept({ method: 'GET', url: /\/maps\/zDP78aJU8nX/ }, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.basemap = { id: 'openStreetMap' }
                res.send({ body: res.body })
            })
        }).as('openMap')

        cy.visit('/?id=zDP78aJU8nX', EXTENDED_TIMEOUT)
        cy.wait('@openMap', EXTENDED_TIMEOUT)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        checkBasemap.cardIsVisible()
        checkBasemap.isVisible()
        checkBasemap.activeBasemap('OSM Detailed')
    })

    it('open map with external basemap string', () => {
        cy.intercept({ method: 'GET', url: /\/maps\/qTfO4YkQ9xW/ }, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.basemap = 'LOw2p0kPwua'
                res.send({ body: res.body })
            })
        }).as('openMap')

        cy.visit('/?id=qTfO4YkQ9xW', EXTENDED_TIMEOUT)
        cy.wait('@openMap', EXTENDED_TIMEOUT)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        checkBasemap.cardIsVisible()
        checkBasemap.isVisible()
        checkBasemap.activeBasemap('Dark basemap')
    })

    it('open map with no basemap uses fallback basemap (OSM Light) when system default basemap is not set', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                delete res.body.keyDefaultBaseMap

                res.send({
                    body: res.body,
                })
            })
        })
        cy.intercept({ method: 'GET', url: /\/maps\/ZugJzZ7xxRW/ }, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                delete res.body.basemap
                res.send({ body: res.body })
            })
        }).as('openMap')

        cy.visit('/?id=ZugJzZ7xxRW', EXTENDED_TIMEOUT)
        cy.wait('@openMap', EXTENDED_TIMEOUT)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        checkBasemap.cardIsVisible()
        checkBasemap.isVisible()
        checkBasemap.activeBasemap('OSM Light')
    })

    it('open map with unknown basemap uses system default basemap (which is set to an external basemap)', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.keyDefaultBaseMap = 'LOw2p0kPwua' //Dark basemap

                res.send({
                    body: res.body,
                })
            })
        }).as('systemSettings')
        cy.intercept({ method: 'GET', url: /\/maps\/wIIoj44X77r/ }, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.basemap = 'unknoWNvSQd'
                res.send({ body: res.body })
            })
        }).as('openMap')

        cy.visit('/?id=wIIoj44X77r', EXTENDED_TIMEOUT)
        cy.wait('@systemSettings', EXTENDED_TIMEOUT)
        cy.wait('@openMap', EXTENDED_TIMEOUT)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        checkBasemap.cardIsVisible()
        checkBasemap.isVisible()
        checkBasemap.activeBasemap('Dark basemap')
    })

    it('open map with unknown basemap uses fallback basemap (OSM Light) when system default basemap is invalid', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.keyDefaultBaseMap = 'noexist'

                res.send({
                    body: res.body,
                })
            })
        }).as('systemSettings')
        cy.intercept({ method: 'GET', url: /\/maps\/wIIoj44X77r/ }, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.basemap = 'unknoWNvSQd'
                res.send({ body: res.body })
            })
        }).as('openMap')

        cy.visit('/?id=wIIoj44X77r', EXTENDED_TIMEOUT)
        cy.wait('@systemSettings', EXTENDED_TIMEOUT)
        cy.wait('@openMap', EXTENDED_TIMEOUT)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        checkBasemap.cardIsVisible()
        checkBasemap.isVisible()
        checkBasemap.activeBasemap('OSM Light')
    })
})
