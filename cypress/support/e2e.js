import './commands.js'

const LOGIN_ENDPOINT = 'dhis-web-commons-security/login.action'
const SESSION_COOKIE_NAME = 'JSESSIONID'
const LOCAL_STORAGE_KEY = 'DHIS2_BASE_URL'

// '2.39' or 39?
const computeEnvVariableName = (instanceVersion) =>
    typeof instanceVersion === 'number'
        ? `${SESSION_COOKIE_NAME}_${instanceVersion}`
        : `${SESSION_COOKIE_NAME}_${instanceVersion.split('.').pop()}`

const findSessionCookieForBaseUrl = (baseUrl, cookies) =>
    cookies.find(
        (cookie) =>
            cookie.name === SESSION_COOKIE_NAME && baseUrl.includes(cookie.path)
    )

before(() => {
    const username = Cypress.env('dhis2Username')
    const password = Cypress.env('dhis2Password')
    const baseUrl = Cypress.env('dhis2BaseUrl')
    const instanceVersion = Cypress.env('dhis2InstanceVersion')

    cy.request({
        url: `${baseUrl}/${LOGIN_ENDPOINT}`,
        method: 'POST',
        form: true,
        followRedirect: true,
        body: {
            j_username: username,
            j_password: password,
            '2fa_code': '',
        },
    }).should((response) => {
        expect(response.status).to.eq(200)
    })

    cy.getAllCookies()
        .should((cookies) => {
            expect(cookies.length).to.be.at.least(1)
        })
        .then((cookies) => {
            const sessionCookieForBaseUrl = findSessionCookieForBaseUrl(
                baseUrl,
                cookies
            )
            Cypress.env(
                computeEnvVariableName(instanceVersion),
                JSON.stringify(sessionCookieForBaseUrl)
            )
        })
})

beforeEach(() => {
    const baseUrl = Cypress.env('dhis2BaseUrl')
    const instanceVersion = Cypress.env('dhis2InstanceVersion')
    const envVariableName = computeEnvVariableName(instanceVersion)
    const { name, value, ...options } = JSON.parse(Cypress.env(envVariableName))

    localStorage.setItem(LOCAL_STORAGE_KEY, baseUrl)
    cy.setCookie(name, value, options)

    cy.getAllCookies().should((cookies) => {
        expect(findSessionCookieForBaseUrl(baseUrl, cookies)).to.exist
        expect(localStorage.getItem(LOCAL_STORAGE_KEY)).to.equal(baseUrl)
    })
})
