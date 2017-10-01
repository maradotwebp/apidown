//Importing request
const request = require('request');

//Cache for requests
const cache = {};

/*
    Entry point of application.
    Returned with:
        const api = require('apidown')
        const testApi = api('www.sample-api.com')
*/
function ApiOptions(url) {
    this.url = url;

    //TODO: Add configuration methods

    //Returns new ApiObject
    return new Api(url);
}

/*
    The functions in Api get called with:
        testApi.fetch('/users', cb);
*/
function Api(url) {

    //Calls the endpoint and returns the body. If available, return cache first.
    //The callback is called with vars "error" and "result".
    function fetch(endpoint, cb, options) {
        //Avoid wrong input.
        url = url.startsWith('http') ? url : 'http://' + url;
        url = url.endsWith('/') ? url : (url += '/');
        endpoint = endpoint.startsWith('/') ? endpoint.replace('/', '') : endpoint;
        const finUrl = url + endpoint;

        //If data in cache, callback with no error and data in cache
        if (cache[finUrl]) {
            cb(undefined, { data: cache[finUrl], cache: true });
        }
        //Else, fetch data from URL.
        else {
            request(finUrl, function (error, response, body) {
                if (error) {
                    cb(error);
                } else if (response && response.statusCode >= 400) {
                    cb(new Error(response.statusCode + ' returned.'));
                    //TODO: Add more error cases (no body, error statusCodes, ...)
                } else {
                    //Save data to cache
                    cache[finUrl] = body;

                    //Call callback
                    cb(undefined, { data: body, cache: false });
                }
            })
        }
    }

    //Set object methods with this
    this.fetch = fetch;
}

//Export ApiOptions function
module.exports = ApiOptions;
