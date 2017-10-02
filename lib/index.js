const request = require('request');

//Cache for requests
var cache = {};


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
    //Default options, which will be overridden
    const defaultOptions = {
        preferOnline: false,
        parseJson: false,
        authentication: {
            enabled: false,
            text: false
        },
        headers: false
    }

    //PUBLIC METHODS
    //Fetch from webserver, with caching enabled
    this.fetch = function (endpoint, cb, options) {
        options = Object.assign({}, defaultOptions, options);
        const finUrl = urlWithEndpoint(url, endpoint);
        const method = (options.preferOnline) ? onlineFirst : offlineFirst;
        //TODO: Check for authentication in the method
        method(finUrl, cb, options);
    }
    //Set a clear-text password.
    this.withPassword = function (pwd) {
        defaultOptions.authentication.enabled = true;
        defaultOptions.authentication.text = pwd;
    }
    //Set custom headers.
    this.withHeaders = function (headers) {
        defaultOptions.headers = headers;
    }


    //PRIVATE METHODS
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
            request({ url: finUrl, headers: options.headers }, function (error, response, body) {
                if (websiteAvailable(error, response, body)) {
                    // automatic parse body as JSON if set in options.parseJson
                    if (options.parseJson) {
                        try {
                            var json = JSON.parse(body);
                            cache[finUrl] = json;
                            cb(undefined, { data: json, cache: false });
                        }
                        catch (e) {
                            // error occur in parsing JSON, just return back with Error
                            cb(new Error('JSON Parse error [' + e.message + ']'));
                        }
                    }
                    // no need to parse data as JSON
                    else {
                        cache[finUrl] = body;
                        cb(undefined, { data: body, cache: false });
                    }
                } else {
                    cb(new Error('Website not available.'));
                }
            })
        }

    }
    //Return data, online-first.
    function onlineFirst(finUrl, cb, options) {
        request({ url: finUrl, headers: options.headers }, function (error, response, body) {
            if (websiteAvailable(error, response, body)) {
                // automatic parse body as JSON if set in options.parseJson
                if (options.parseJson) {
                    try {
                        var json = JSON.parse(body);
                        cache[finUrl] = json;
                        cb(undefined, { data: json, cache: false });
                    }
                    catch (e) {
                        // error occur in parsing JSON, just return back with Error
                        cb(new Error('JSON Parse error [' + e.message + ']'));
                    }
                }
                // no need to parse data as JSON
                else {
                    cache[finUrl] = body;
                    cb(undefined, { data: body, cache: false });
                }
            } else {
                if (cache[finUrl]) {
                    cb(undefined, { data: cache[finUrl], cache: true });
                } else {
                    cb(new Error('Website not available.'));
                }
            }
        })
    }


    //TEST METHODS
    //Add an Item to cache.
    this.__addToCache = function (endpoint, obj) {
        const finUrl = urlWithEndpoint(url, endpoint);
        cache[finUrl] = obj;
    }
    //Clear the whole cache.
    this.__clearCache = function () {
        cache = {};
    }
}


//Export ApiOptions function
module.exports = ApiOptions;
