export const EXTENDED_TIMEOUT = { timeout: 15000 }

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
