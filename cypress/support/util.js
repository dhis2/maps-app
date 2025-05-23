export const EXTENDED_TIMEOUT = { timeout: 25000 }
export const POPUP_WAIT = 2500

export const CURRENT_YEAR = new Date().getFullYear()

export const getApiBaseUrl = () => {
    const baseUrl = Cypress.env('dhis2BaseUrl') || ''

    if (!baseUrl) {
        throw new Error(
            "No 'dhis2BaseUrl' found. Please make sure to add it to 'cypress.env.json'"
        )
    }

    return baseUrl
}

export const getDhis2Version = () => {
    const dhis2Version = Cypress.env('dhis2InstanceFullVersion') || ''

    if (!dhis2Version) {
        throw new Error(
            "No 'dhis2InstanceFullVersion' found. Please make sure it was parsed properly from api/system/info'"
        )
    }

    return dhis2Version
}

export const assertMultipleInterceptedRequests = (intercepts, triggerFn) => {
    const filteredIntercepts = intercepts.filter(({ skip }) => !skip)

    filteredIntercepts.forEach(({ method, url, alias }) => {
        cy.intercept({ method, url }).as(alias)
    })

    triggerFn()

    filteredIntercepts.forEach(({ method, alias }) => {
        cy.wait(`@${alias}`, EXTENDED_TIMEOUT)
            .its('request')
            .then((req) => {
                expect(req.method).to.equal(method)
            })
    })
}
