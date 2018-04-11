import isString from 'lodash/fp/isString';
import isObject from 'lodash/fp/isObject';
import { config } from 'd2/lib/d2';

// TODO: Channel all api request through d2

export const apiFetch = async (url, method, body) => {
    const options = {
        headers: {},
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
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
    }

    return fetch(encodeURI(config.baseUrl + url), options)
        .then(
            response =>
                method !== 'PUT' && method !== 'PATCH' && method !== 'DELETE'
                    ? response.json()
                    : response
        ) // Avoids error
        .catch(error => console.log('Error: ', error)); // TODO: Better error handling
};
