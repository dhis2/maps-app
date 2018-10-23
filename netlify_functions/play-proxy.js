const request = require('request')
const querystring = require('querystring')
const uuidv4 = require('uuid/v4')

const PLAY_URL = 'https://play.dhis2.org/dev/';

exports.handler = function(event, context, callback) {
  const origin = event.headers['origin'] || event.headers['Origin'] || '';
  const method = event.httpMethod.toUpperCase();
  
  console.log(`Received ${event.httpMethod} request from, origin: ${origin}`)

  const params = method === 'GET' ? event.queryStringParameters : JSON.parse(event.body)
  const headers = event.headers || {}

  // admin:district
  headers['Authentication'] = 'Basic YWRtaW46ZGlzdHJpY3Q=';

  console.info('proxying params:', params)
  const qs = querystring.stringify(params)
  
  const url = PLAY_URL + qs;
  console.info('URL:', qs);

  const reqOptions = {
    method: method,
    headers: headers,
    url: url,
    body: event.body,
  }

  request(reqOptions, (error, result) => {
    if (error) {
      console.info('Upstream error!', error);
      callback(null, {
        statusCode: 500,
        body: `Failed to proxy to '${url}'`,
      });
    } else {
      console.info('Upstream status code', result.statusCode, result.statusMessage);
      callback(null, result);
    }
  })
}
