import { getInstance as getD2 } from 'd2'
import { isString, isObject } from 'lodash/fp'

// The api/configuration/xx endpoints returns an empty body if the config is not set
// This is a replacement for response.json() which gives error if body is empty
// https://stackoverflow.com/a/51320025
const getJsonResponse = async (response) => {
    const string = await response.text()
    const json = string === '' ? undefined : JSON.parse(string)
    return json
}

export const apiFetch = async (url, method, body) => {
    const d2 = await getD2()
    const options = {
        headers: {
            'Content-Type': 'application/json', // Default API response
        },
    }

    options.credentials = 'include'

    if (method && body) {
        options.method = method

        if (isString(body)) {
            options.headers['Content-Type'] = 'text/html'
            options.body = body
        } else if (isObject(body)) {
            options.body = JSON.stringify(body)
        }
    }

    const baseUrl = d2.Api.getApi().baseUrl

    // TODO: Better error handling
    return fetch(encodeURI(baseUrl + url), options)
        .then((response) =>
            ['POST', 'PUT', 'PATCH'].includes(method)
                ? response
                : getJsonResponse(response)
        )
        .catch((error) => console.log('Error: ', error))
}
