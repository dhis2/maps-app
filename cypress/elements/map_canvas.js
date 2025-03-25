import { EXTENDED_TIMEOUT } from '../support/util.js'

export const MENU_HEIGHT = 32
export const IFRAME_HEADER_HEIGHT = 48
export const GLOBAL_HEADER_HEIGHT = 40
export const DOWNLOAD_HEADER_HEIGHT = 48
export const DOWNLOAD_BORDER = 24

export const getMaps = () => cy.get('.dhis2-map canvas', EXTENDED_TIMEOUT)

export const assertMapPosition = (expectedBottoms, expectedHeights) => {
    getMaps().then(($canvas) => {
        const boundingRect = $canvas[0].getBoundingClientRect()
        expect(expectedBottoms).to.include(boundingRect.bottom)
        expect(expectedHeights).to.include(boundingRect.height)
    })
}
