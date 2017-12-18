import { config } from 'd2/lib/d2';

// TODO: Channel all api request through d2
export function apiFetch(url, method, body) {
    const options = {
        headers: {}
    };

    if (config.context.auth) {
        options.headers['Authorization'] = 'Basic ' + btoa(config.context.auth);
    } else {
        options.credentials = 'include';
    }

    if (method && body) {
        options.method = method;
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    return fetch(encodeURI(config.baseUrl + url), options)
        .then(res => res.json())
        .catch(error => console.log('Error: ', error)); // TODO: Better error handling
}

