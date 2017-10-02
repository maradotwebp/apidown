const request = require('request');
const _ = require("lodash");

//Cache for requests
var cache = {};

class _FormData {

}
try {
    FormData = FormData || _FormData;
}
catch (e) {
    FormData = _FormData;
}
const defaultOptions = {
 preferOnline: false,
 method: "GET"
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

/**
 * A helper method to serailize an object.
 * @param {*} obj to serialize
 */
const serialize = (obj) => {
    if(_.isString(obj) || obj instanceof FormData) {
        return obj;
    }
    return JSON.stringify(obj);
}

const pattern = /:[a-zA-Z]+([0-9]|_|[a-zA-Z])*/g; //< The regular expresion to find places to replace in a url template

/**
 * Builds the url
 * @param {String} url the url format
 * @param {object} params the object used to build the url
 */
const buildUrl = (url, params={}) => {
    url = url.replace(pattern, (match) => {
        match = match.slice(1); // Get the match minus the colon. ex transforms :ride_id -> ride_id
        let value = params[match];
        if(!value) {
            throw {message: "Value is undefined, cannot build url", code: -1}
        }
        delete params[match];
        return value;
    });
    return [url, params];
}

/**
 * Creates a query string from the params object
 * @param {*} params an object to connvert
 * @param {String} the query string
 */
const createQueryString = (params) => {
  return Object.keys(params).map((key) => {
    key = encodeURIComponent(key);
    let value = encodeURIComponent(params[key]);
    return `${key}=${value}`;
  }).join("&");
}

/*
    The functions in Api get called with:
        testApi.fetch('/users', cb);
*/
function Api(url) {
    //Default options, which will be overridden
    const defaultOptions = {
        preferOnline: false,
        authentication: {
            type: 'none'
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
        defaultOptions.authentication.type = 'text';
        defaultOptions.authentication.pwd = pwd;
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
        request({ url: finUrl, headers: options.headers }, function (error, response, body) {
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

    /**
     * returns a function that sends requst to the server
     * @param endpoint the API endpoint
     * @param method the method for the endpoint
     * @param headers the headers for the endpoint
     * @param config the config for the endpoint
     */
    this.defineEndpoint = (endpoint, method, headers={}, config={}) => {
        config = Object.assign({}, defaultOptions, config);
        config.method = method;
        /**
         * sends a request to the server, returns a promise
         * @param payload the payload for the request
         * @param local_headers the headers for the request
         * @param local_config the config for the request
         */
        return (payload={}, local_headers={}, local_config={}) => {
            [endpoint, payload] = buildUrl(endpoint, payload);
            return new Promise((resolve, reject) => {
                local_config = Object.assign({}, config, local_config);
                local_headers = Object.assign({}, headers, local_headers);
                local_config.headers = local_headers;
                if(local_config.method !== "GET") {
                    local_config.body = serialize(payload);
                }
                else {
                    if (!_.isEmpty(payload)){
                        let qs = createQueryString(payload);
                        endpoint = `${endpoint}?${qs}`;
                    }
                }

                this.fetch(endpoint, (error, request) => {
                    if(error) {
                        reject(error);
                    }
                    else{
                        resolve(request);
                    }
                }, local_config);
            });
        }
    }

    /**
     * Short hand to define a GET endpoint with name `name`
     * @param endpoint the endpoint to send the request to
     * @param headers the header for the request
     * @param config the config for the request
     */
    this.get = (name, endpoint, headers={}, config={}) => {
        this[name] = this.defineEndpoint(endpoint, "GET", headers, config);
        return this;
    }

    /**
     * Short hand to define a POST endpoint with name `name`
     * @param endpoint the endpoint to send the request to
     * @param headers the header for the request
     * @param config the config for the request
     */
    this.post = (name, endpoint, headers={}, config={}) => {
        this[name] = this.defineEndpoint(endpoint, "POST", headers, config);
        return this;
    }

    /**
     * Short hand to define a PUT endpoint with name `name`
     * @param endpoint the endpoint to send the request to
     * @param headers the header for the request
     * @param config the config for the request
     */
    this.put = (name, endpoint, headers={}, config={}) => {
        this[name] = this.defineEndpoint(endpoint, "PUT", headers, config);
        return this;
    }

    /**
     * Short hand to define a DELETE endpoint with name `name`
     * @param endpoint the endpoint to send the request to
     * @param headers the header for the request
     * @param config the config for the request
     */
    this.delete = (name, endpoint, headers={}, config={}) => {
        this[name] = this.defineEndpoint(endpoint, "DELETE", headers, config);
        return this;
    }

    /**
     * Short hand to define a PATCH endpoint with name `name`
     * @param endpoint the endpoint to send the request to
     * @param headers the header for the request
     * @param config the config for the request
     */
    this.patch = (name, endpoint, headers={}, config={}) => {
        this[name] = this.defineEndpoint(endpoint, "PATCH", headers, config);
        return this;
    }

    /**
     * Short hand to create all of the requests related to a single resource.
     * Adds an object with methods find, all, delete, create and update to the API
     * @param name the name of the resource. This could also be the url
     * @param methods an array of methods to support
     * @param headers the headers for this resource
     * @param config the config for this resource
     * @param base_url the base url for the resource (if something other than `name`)
     * @param key the key to format for find, update, and delete
     */
    this.resource = (name, methods=["GET", "POST", "PUT", "DELETE"], headers={}, config={}, base_url=null, key="id") => {
        base_url = base_url || `/${name}`;
        let single_url = `${base_url}/:${key}`;
        let url;
        let resources = methods.reduce((acc, method)=> {
            let methodName;
            switch (method){
                case "GET":
                    acc.all = this.defineEndpoint(base_url, method, headers, config);
                    acc.all.url = base_url;
                    acc.all.buildUrl = (payload) => {
                        return buildUrl(base_url, payload)[0];
                    }
                    acc.find = this.defineEndpoint(single_url, method, headers, config);
                    acc.find.url = single_url;
                    acc.find.buildUrl = (payload) => {
                        return buildUrl(base_url, payload)[0];
                    }
                    return acc;
                case "POST":
                    url = base_url;
                    methodName = "create";
                    break;
                case "DELETE":
                    methodName = "delete";
                    url = single_url;
                    break;
                case "PUT":
                case "PATCH":
                    methodName = "update";
                    url = single_url;
                    break;
                default:
                    break;
            }
            acc[methodName] = this.defineEndpoint(url, method, headers, config);
            acc[methodName].url = url;
            acc[methodName].buildUrl = (payload) => {
                return buildUrl(url, payload)[0];
            }
            return acc;
        }, {});
        this[name] = resources;
        return this;
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
