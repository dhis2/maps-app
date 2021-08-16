import { isString, isObject } from 'lodash/fp';
import { config } from 'd2';

export const apiFetch = async (url, method, body) => {
    const options = {
        headers: {
            'Content-Type': 'application/json', // Default API response
        },
    };

    if (config.context && config.context.auth) {
        options.headers['Authorization'] = 'Basic ' + btoa(config.context.auth);
    } else {
        options.credentials = 'include';
    }

    if (method && body) {
        options.method = method;

        if (isString(body)) {
            options.headers['Content-Type'] = 'text/html';
            options.body = body;
        } else if (isObject(body)) {
            options.body = JSON.stringify(body);
        }
    }

    // TODO: Better error handling
    return fetch(encodeURI(config.baseUrl + url), options)
        .then(response =>
            ['POST', 'PUT', 'PATCH'].includes(method)
                ? response
                : response.json()
        )
        .catch(error => console.log('Error: ', error)); // eslint-disable-line
};
