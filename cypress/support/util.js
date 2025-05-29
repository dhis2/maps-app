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
    intercepts.forEach(({ method, url, alias }) => {
        cy.intercept({ method, url }).as(alias)
    })

    triggerFn()

    intercepts.forEach(({ method, alias }) => {
        cy.wait(`@${alias}`, EXTENDED_TIMEOUT)
            .its('request')
            .then((req) => {
                expect(req.method).to.equal(method)
            })
    })
}

/**
 * Utility to set up multiple intercepts with optional custom responses,
 * trigger requests, and perform assertions.
 * Supports batch or per-intercept triggering.
 *
 * @param {Array} intercepts - Array of intercept objects:
 *   @param {boolean} intercepts[].skip - Skip this intercept.
 *   @param {string} intercepts[].method - HTTP method (required).
 *   @param {string|RegExp} intercepts[].url - URL to intercept (required).
 *   @param {string} intercepts[].alias - Alias for the intercept (required).
 *   @param {number} [intercepts[].statusCode] - Mock status code.
 *   @param {any} [intercepts[].body] - Mock response body.
 *   @param {boolean} [intercepts[].forceNoCache] - Force server to treat request as fresh.
 *   @param {boolean} [intercepts[].forceNetworkError] - Simulate network error.
 *   @param {boolean} [intercepts[].forceNetworkErrorWithDelay] - Simulate network error with 1000ms delay.
 *   @param {function} [intercepts[].onIntercept] - Optional callback to directly manipulate the request object.
 *   @param {function} [intercepts[].triggerFn] - Optional trigger function for this intercept.
 *   @param {function} [intercepts[].assertFn] - Optional assert function for this intercept.
 *
 * @param {function} [commonTriggerFn] - Common trigger function used if intercept-specific triggerFn is missing.
 * @param {function} [commonAssertFn] - Common assert function used if intercept-specific assertFn is missing.
 * @param {Object} [timeout=EXTENDED_TIMEOUT] - Cypress timeout options, defaulting to EXTENDED_TIMEOUT object.
 * @param {boolean} [perInterceptTrigger=false] - Whether to trigger per intercept or once for all.
 */
export const assertIntercepts = ({
    intercepts,
    commonTriggerFn,
    commonAssertFn,
    timeout = EXTENDED_TIMEOUT,
    perInterceptTrigger = false,
}) => {
    const filtered = intercepts.filter(({ skip }) => !skip)
    if (filtered.length === 0) {
        return
    }

    const setupIntercept = ({
        method,
        url,
        alias,
        statusCode,
        body,
        forceNoCache,
        forceNetworkError,
        forceNetworkErrorWithDelay,
        onIntercept,
    }) => {
        cy.intercept({ method, url }, (req) => {
            if (forceNoCache) {
                delete req.headers['if-none-match']
                delete req.headers['if-modified-since']
                req.headers['cache-control'] = 'no-cache'
            }
            if (typeof onIntercept === 'function') {
                onIntercept(req)
            }
            if (forceNetworkError || forceNetworkErrorWithDelay) {
                req.destroy()
            } else if (statusCode !== undefined || body !== undefined) {
                req.reply({
                    statusCode,
                    body,
                    delay: forceNetworkErrorWithDelay ? 1000 : 0,
                })
            } else {
                req.continue()
            }
        }).as(alias)
    }

    const waitAndAssert = ({ method, alias, assertFn }) => {
        cy.wait(`@${alias}`, timeout).then((interception) => {
            expect(interception.request.method).to.equal(method)
            const fn = assertFn || commonAssertFn
            if (typeof fn !== 'function') {
                throw new Error(
                    `Missing assertFn for intercept alias: ${alias}`
                )
            }
            fn({ alias })
        })
    }

    if (perInterceptTrigger) {
        filtered.forEach((intercept, index) => {
            const { triggerFn, alias } = intercept

            cy.log(`Intercepting: ${alias}`)

            // Reset previous: no mocking, no destroying
            if (index > 0) {
                const prevIntercept = filtered[index - 1]
                setupIntercept({
                    method: prevIntercept.method,
                    url: prevIntercept.url,
                    alias: prevIntercept.alias,
                })
            }
            setupIntercept(intercept)

            const fn = triggerFn || commonTriggerFn
            if (typeof fn !== 'function') {
                throw new Error(
                    `Missing triggerFn for intercept alias: ${alias}`
                )
            }
            fn({ alias })

            waitAndAssert(intercept)
        })

        // Reset last: no mocking, no destroying
        const lastIntercept = filtered[filtered.length - 1] //.at(-1)
        setupIntercept({
            method: lastIntercept.method,
            url: lastIntercept.url,
            alias: lastIntercept.alias,
        })
    } else {
        filtered.forEach(setupIntercept)

        cy.log(`Intercepting: batch`)

        if (typeof commonTriggerFn !== 'function') {
            throw new Error('Missing commonTriggerFn for batch mode')
        }
        commonTriggerFn()

        filtered.forEach(waitAndAssert)

        // Reset all: no mocking, no destroying
        filtered.forEach(({ method, url, alias }) => {
            setupIntercept({ method, url, alias })
        })
    }
}
