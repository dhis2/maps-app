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

/**
 * Utility to get HTTP status text from status code.
 *
 * @param {number} statusCode
 * @returns {string}
 */
const getHttpStatusText = (statusCode) => {
    const statusTexts = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        409: 'Conflict',
        500: 'Internal Server Error',
        503: 'Service Unavailable',
    }
    return statusTexts[statusCode] || 'Error'
}

/**
 * Utility to set up a single Cypress intercept.
 * Supports simulating errors (network or HTTP) and forcing cache bypass.
 *
 * @param {Object} params
 * @param {string} params.method - HTTP method (GET, POST, etc.).
 * @param {string|RegExp} params.url - URL or pattern to intercept.
 * @param {string} params.alias - Alias for the intercept (used with cy.wait).
 * @param {number} [params.statusCode] - Default status code if no error simulation.
 * @param {any} [params.body] - Default response body if no error simulation.
 * @param {boolean} [params.forceNoCache] - If true, removes caching headers from the request.
 * @param {'network'|number} [params.error] - Error simulation:
 *     - `'network'` → forcibly destroy request.
 *     - number (e.g. 409) → respond with this HTTP status error.
 * @param {function} [params.onIntercept] - Callback to manipulate the intercepted request.
 */
const setupIntercept = ({
    method,
    url,
    alias,
    statusCode,
    body,
    error,
    forceNoCache,
    onIntercept,
}) => {
    cy.intercept({ method, url }, (req) => {
        // Remove caching headers if requested
        if (forceNoCache) {
            delete req.headers['if-none-match']
            delete req.headers['if-modified-since']
            req.headers['cache-control'] = 'no-cache'
        }

        // Allow custom manipulation of the intercepted request
        if (typeof onIntercept === 'function') {
            onIntercept(req)
        }

        // Handle network error simulation
        if (error === 'network') {
            req.destroy()
            return
        }

        // Handle HTTP error simulation
        if (
            typeof error === 'number' ||
            statusCode !== undefined ||
            body !== undefined
        ) {
            const responseStatus = error || statusCode || 500
            let responseBody = body

            if (typeof error === 'number') {
                responseBody = {
                    httpStatus: getHttpStatusText(responseStatus),
                    httpStatusCode: responseStatus,
                    status: 'ERROR',
                    message: `Simulated error with status code ${responseStatus}`,
                    errorCode: `E${responseStatus}`,
                }
            }

            req.reply({
                statusCode: responseStatus,
                body: responseBody,
            })
            return
        }

        // Default: let the request continue normally
        req.continue()
    }).as(alias)
}

/**
 * Utility to wait for a Cypress intercept and apply an assertion function, if provided.
 *
 * @param {Object} params
 * @param {string} params.method - The HTTP method to assert for the intercept.
 * @param {string} params.alias - The intercept alias to wait for.
 * @param {string|number} [error] - Error code
 * @param {function} [params.assertFn] - Specific assertion function for this intercept.
 * @param {function} [params.commonAssertFn] - Fallback assertion function if assertFn is not provided.
 * @param {number} [params.timeout=EXTENDED_TIMEOUT] - Optional timeout for cy.wait.
 */
const waitAndAssert = ({
    method,
    alias,
    error,
    assertFn,
    timeout = EXTENDED_TIMEOUT,
}) => {
    cy.wait(`@${alias}`, timeout).then((interception) => {
        expect(interception.request.method).to.equal(method)

        if (typeof assertFn === 'function') {
            assertFn({ alias, error, interception })
        }
        // If no assertion function is provided, skip additional assertions
    })
}

function normalizeError(error) {
    const isValid = (val) => typeof val === 'string' || typeof val === 'number'

    if (Array.isArray(error)) {
        return error.find(isValid)
    }

    return isValid(error) ? error : undefined
}

function normalizeErrors(errors) {
    const isValid = (val) => typeof val === 'string' || typeof val === 'number'

    let normalized
    if (Array.isArray(errors)) {
        normalized = errors.filter(isValid)
    } else if (isValid(errors)) {
        normalized = [errors]
    } else {
        return [undefined]
    }

    return normalized.length > 0 ? normalized : [undefined]
}

/**
 * Utility to handle multiple HTTP intercepts with triggers and assertions.
 *
 * Supports two modes:
 * 1) Single intercept mode (default):
 *    - Each intercept triggers and asserts independently.
 *    - Supports per-intercept triggerFn, assertFn, and `errors` array.
 *
 * 2) Grouped intercepts mode:
 *    - Defined by an object containing `intercepts` array.
 *    - Trigger and assert run once for the whole group.
 *    - Per-intercept `error` (string or number) supported.
 *    - No per-intercept triggerFn or assertFn in groups.
 *
 * ----
 * Error simulation:
 * - Single intercepts support `errors: Array<string|number>` to simulate:
 *    - `'network'`  → network error simulation
 *    - HTTP status code (e.g. 409) → mock error response
 * - Group intercepts support a single `error: string|number` per intercept.
 *
 * ----
 * Interaction between error simulation and response:
 * - If any error (network or HTTP status) is specified, it takes precedence over
 *   `statusCode` and `body`.
 * - If no error simulation is set, then `statusCode` and `body` define the mock response.
 *
 *
 * @param {Object} params
 * @param {Array<Object>} params.intercepts
 *   Array of intercept objects or grouped intercepts:
 *
 *   Single intercept object properties:
 *   @param {string} alias - Alias for the intercept (required).
 *   @param {string} method - HTTP method (required).
 *   @param {string|RegExp} url - URL pattern to intercept (required).
 *   @param {Array<string|number>} [errors] - Error simulation array,
 *     the trigger/assert process will be executed for each error in the array:
 *       - `'network'` to simulate network error,
 *       - HTTP status code (e.g. 409) to simulate error response.
 *   @param {number} [statusCode] - Mock response HTTP status code (if no error simulated).
 *   @param {any} [body] - Mock response body (if no error simulated).
 *   @param {boolean} [forceNoCache] - Force fresh server response.
 *   @param {function} [onIntercept] - Optional callback to manipulate the intercepted request.
 *   @param {function} [triggerFn] - Trigger function to run the request for this intercept.
 *   @param {function} [assertFn] - Assertion function for this intercept.
 *   @param {boolean} [skip] - If true, skip this intercept.
 *
 *   Grouped intercepts object properties:
 *   @param {string} alias - Alias for the group (required).
 *   @param {Array<Object>} intercepts - Array of intercept objects (without `errors` array).
 *     Each group intercept may specify:
 *       - `error` (string or number): single error type to simulate for this intercept.
 *       - Other properties same as single intercept, excluding `triggerFn`, `assertFn`, and `errors`.
 *   @param {function} [triggerFn] - Trigger function for the entire group.
 *   @param {function} [assertFn] - Assertion function for the entire group.
 *   @param {boolean} [skip] - If true, skip this group.
 *
 * @param {function} [commonTriggerFn] - Default trigger function used for intercepts without
 *                                        specific `triggerFn` or `groupTriggerFn`.
 * @param {function} [commonAssertFn] - Default assertion function used similarly.
 * @param {number|Object} [timeout=EXTENDED_TIMEOUT] - Default Cypress timeout.
 */
export const assertIntercepts = ({
    intercepts,
    commonTriggerFn,
    commonAssertFn,
    timeout = EXTENDED_TIMEOUT,
}) => {
    const activeIntercepts = intercepts.filter(({ skip }) => !skip)
    if (activeIntercepts.length === 0) {
        return
    }

    activeIntercepts.forEach((intercept, i) => {
        const n = i + 1
        const { alias, triggerFn, assertFn } = intercept

        if (intercept.intercepts && Array.isArray(intercept.intercepts)) {
            // Grouped intercepts
            const groupIntercepts = intercept.intercepts.filter(
                ({ skip }) => !skip
            )

            if (groupIntercepts.length === 0) {
                return
            }

            cy.log(`[${n}] Intercepting group: ${alias}`)

            // Setup these intercepts
            groupIntercepts.forEach(
                ({
                    method,
                    url,
                    alias,
                    statusCode,
                    body,
                    forceNoCache,
                    error,
                    onIntercept,
                }) => {
                    setupIntercept({
                        method,
                        url,
                        alias,
                        statusCode,
                        body,
                        forceNoCache,
                        error: normalizeError(error),
                        onIntercept,
                    })
                }
            )

            // Trigger the requests
            const fn = triggerFn || commonTriggerFn
            if (typeof fn !== 'function') {
                throw new Error(
                    `[${n}] Missing triggerFn for intercepts group: ${alias}`
                )
            }
            fn({ alias })

            // Assert
            groupIntercepts.forEach(({ method, alias, error }) => {
                waitAndAssert({
                    method,
                    alias,
                    error,
                    assertFn: assertFn || commonAssertFn,
                    timeout,
                })
            })

            // Reset intercepts group to default: no mocking, no destroying
            groupIntercepts.forEach(({ method, url, alias }) => {
                setupIntercept({ method, url, alias })
            })
        } else {
            const { method, url, errors } = intercept

            normalizeErrors(errors).forEach((error) => {
                // Single intercept
                cy.log(
                    `[${n}] Intercepting single: ${alias}${
                        error !== undefined ? ` - ${error}` : ''
                    }`
                )

                // Setup this intercept
                setupIntercept({ ...intercept, error })

                // Trigger the request
                const fn = triggerFn || commonTriggerFn
                if (typeof fn !== 'function') {
                    throw new Error(
                        `[${n}] Missing triggerFn for single intercept: ${alias}`
                    )
                }
                fn({ alias, error })

                // Assert
                waitAndAssert({
                    method,
                    alias,
                    error,
                    assertFn: assertFn || commonAssertFn,
                    timeout,
                })

                // Reset single intercept to default: no mocking, no destroying
                setupIntercept({
                    method,
                    url,
                    alias,
                })
            })
        }
    })
}
