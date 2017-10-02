const request = require('request');
const qs = require('querystring')

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
    var defaultOptions = {
        preferOnline: false,
        authentication: {
            enabled: false,
            text: false
        }
    }
    // TODO defaultOptions should be a member of this "class"
    // oterw
    this.defaultOptions = defaultOptions

    this.password = function (pwd) {
        defaultOptions.authentication.enabled = true;
        defaultOptions.authentication.text = pwd;
       
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

        return true;
    }
    //Return data, offline-first.
    function offlineFirst(finUrl, cb, options) {
        if (cache[finUrl]) {
            cb(undefined, { data: cache[finUrl], cache: true });
        } else {
            makeRequest(finUrl, options, function (error, response, body) {
                if (websiteAvailable(error, response, body)) {
                    cache[finUrl] = body;
                    cb(undefined, { data: body, cache: false });
                } else {
                    cb(new Error('Website not available.'));
                }
            })
        }

    }

    function makeRequest(findUrl, options, cb) {
        // add key if authentication enabled
        if(options.authentication.enabled && findUrl.charAt(findUrl.length - 1) != '/'){
            const query = qs.stringify({ 'key' : options.authentication.text}) 
            findUrl.charAt(findUrl.length - 1) == '&' ? findUrl += query : findUrl +=`&${query}`
        }
        request(findUrl,cb)      
    }
    //Return data, online-first.
    function onlineFirst(finUrl, cb, options) {
        makeRequest(finUrl, options, function (error, response, body) {
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
