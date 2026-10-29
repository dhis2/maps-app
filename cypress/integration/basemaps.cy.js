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

    it('open map with basemaps = [{ hidden: true }] uses default basemap set to not visible', () => {
        cy.intercept({ method: 'GET', url: /\/maps\/ytkZY3ChM6J/ }, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                delete res.body.basemap
                res.body.basemaps = [{ hidden: true }]
                res.send({ body: res.body })
            })
        }).as('openMap')

        cy.visit('/?id=ytkZY3ChM6J')
        cy.wait('@openMap', EXTENDED_TIMEOUT)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        checkBasemap.cardIsVisible()
        checkBasemap.isNotVisible()
    })

    // basemap (singular) is the pre-43 format, kept for maps saved before the DHIS2-20417 migration
    it('open map with legacy basemap = none uses default basemap set to not visible', () => {
        cy.intercept({ method: 'GET', url: /\/maps\/ytkZY3ChM6J/ }, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                delete res.body.basemaps
                res.body.basemap = 'none'
                res.send({ body: res.body })
            })
        }).as('openMap')

        cy.visit('/?id=ytkZY3ChM6J')
        cy.wait('@openMap', EXTENDED_TIMEOUT)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        checkBasemap.cardIsVisible()
        checkBasemap.isNotVisible()
    })

    it('open map with basemaps = [{ id }] uses id from the basemaps array', () => {
        cy.intercept({ method: 'GET', url: /\/maps\/zDP78aJU8nX/ }, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                delete res.body.basemap
                res.body.basemaps = [{ id: 'openStreetMap' }]
                res.send({ body: res.body })
            })
        }).as('openMap')

        cy.visit('/?id=zDP78aJU8nX')
        cy.wait('@openMap', EXTENDED_TIMEOUT)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        checkBasemap.cardIsVisible()
        checkBasemap.isVisible()
        checkBasemap.activeBasemap('OSM Detailed')
    })

    // basemap (singular) is the pre-43 format, kept for maps saved before the DHIS2-20417 migration
    it('open map with legacy basemap object uses id from the object', () => {
        cy.intercept({ method: 'GET', url: /\/maps\/zDP78aJU8nX/ }, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                delete res.body.basemaps
                res.body.basemap = { id: 'openStreetMap' }
                res.send({ body: res.body })
            })
        }).as('openMap')

        cy.visit('/?id=zDP78aJU8nX')
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

        cy.visit('/?id=qTfO4YkQ9xW')
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

        cy.visit('/?id=ZugJzZ7xxRW')
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

        cy.visit('/?id=wIIoj44X77r')
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

        cy.visit('/?id=wIIoj44X77r')
        cy.wait('@systemSettings', EXTENDED_TIMEOUT)
        cy.wait('@openMap', EXTENDED_TIMEOUT)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        checkBasemap.cardIsVisible()
        checkBasemap.isVisible()
        checkBasemap.activeBasemap('OSM Light')
    })

    // The default view includes North Africa, where OSM Light labels are in Arabic
    it('shapes the Arabic labels of the OSM Light basemap with the RTL text plugin', () => {
        // No system default, so the map uses the fallback basemap (OSM Light)
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                delete res.body.keyDefaultBaseMap
                res.send({ body: res.body })
            })
        })

        // Always the full response, not a 304 for a cached file
        cy.intercept('GET', /mapbox-gl-rtl-text[^/]*\.js/, (req) => {
            delete req.headers['if-none-match']
            delete req.headers['if-modified-since']
        }).as('rtlTextPlugin')

        // Dev mode loads more files than the default buffer keeps. Set on every
        // page load, since the app can reload itself once after the visit
        cy.on('window:before:load', (win) => {
            win.performance.setResourceTimingBufferSize(10000)
            cy.spy(win.console, 'error').as('consoleError')
        })

        cy.visit('/')

        cy.wait('@rtlTextPlugin', EXTENDED_TIMEOUT)
            .its('response')
            .should((response) => {
                expect(response.statusCode).to.eq(200)
                expect(response.headers['content-type']).to.match(/javascript/)
            })

        // Only shaped Arabic uses these glyphs (presentation forms). Resource
        // timings also list glyphs from the browser cache, unlike cy.intercept
        cy.window(EXTENDED_TIMEOUT).should((win) => {
            const urls = win.performance
                .getEntriesByType('resource')
                .map((entry) => entry.name)
            expect(urls.some((url) => /\/65024-65279\.pbf/.test(url))).to.be
                .true
        })

        cy.get('@consoleError').should(
            'not.have.been.calledWith',
            'Failed to set RTL text plugin'
        )
    })
})
