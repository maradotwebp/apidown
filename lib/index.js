const request = require('request');

//Cache for requests
var cache = {};

//Default options, which will be overridden with parameters
const defaultOptions = {
    preferOnline: false
}

/*
    Entry point of application.
    Returned with:
        const api = require('apidown')
        const testApi = api('www.sample-api.com')
*/
function ApiOptions(url) {
    this.url = url;
    //TODO: Configuration methods
    return new Api(url);
}

/*
    The functions in Api get called with:
        testApi.fetch('/users', cb);
*/
function Api(url) {

    function fetch(endpoint, cb, options) {
        options = Object.assign({}, defaultOptions, options);
        const finUrl = urlWithEndpoint(url, endpoint);
        const method = (options.preferOnline) ? onlineFirst : offlineFirst;
        method(finUrl, cb, options);
    }

    //Set object methods with this
    this.fetch = fetch;

    //TEST_METHODS
    this.__addToCache = function (endpoint, obj) {
        const finUrl = urlWithEndpoint(url, endpoint);
        cache[finUrl] = obj;
    }
    this.__clearCache = function() {
        cache = {};
    }
}


//HELPER FUNCTIONS
//Calculate a final url with an url and an endpoint.
function urlWithEndpoint(url, endpoint) {
    url = url.startsWith('http') ? url : 'http://' + url;
    url = url.endsWith('/') ? url : (url += '/');
    endpoint = endpoint.startsWith('/') ? endpoint.replace('/', '') : endpoint;
    return url + endpoint;
}
//Returns false if fetched website returns an error.
function websiteAvailable(error, response, body) {
    if (
        error
        || !response
        || response.statusCode == 404
        || body == ''
        //TODO: Add more error cases (no body, error statusCodes, ...)
    ) return false;
    else return true;
}
//Return data, offline-first.
function offlineFirst(finUrl, cb, options) {
    if (cache[finUrl]) {
        cb(undefined, { data: cache[finUrl], cache: true });
    } else {
        request(finUrl, function (error, response, body) {
            if (websiteAvailable(error, response, body)) {
                cache[finUrl] = body;
                cb(undefined, { data: body, cache: false });
            } else {
                cb(new Error('Website not available.'));
            }
        })
    }

}
//Return data, online-first.
function onlineFirst(finUrl, cb, options) {
    request(finUrl, function (error, response, body) {
        if (websiteAvailable(error, response, body)) {
            cache[finUrl] = body;
            cb(undefined, { data: body, cache: false })
        } else {
            if (cache[finUrl]) {
                cb(undefined, { data: cache[finUrl], cache: true });
            } else {
                cb(new Error('Website not available.'));
            }
        }
    })
}


//Export ApiOptions function
module.exports = ApiOptions;
