//Importing request
const request = require('request');

/*
    Entry point of application.
    Returned with:
        const api = require('apidown')
        const testApi = api('www.sample-api.com')
*/
function ApiOptions(url, options = null) {
    this.url = url;
    
    // `options` is an object. If it is passed, add its entries to ApiOptions
    if (options) {
        for(let [key, value] of Object.entries(options)) {
            this[key] = value
        }  
    }

    //Returns new ApiObject
    return new Api(url, options);
}

/*
    The functions in Api get called with:
        testApi.fetch('/users', options, cb);
*/
function Api() {
    
    //Calls the endpoint and returns the body.
    function fetch(endpoint, options, cb) {
        //Avoid wrong input.
        url = (url.startsWith('http')) ? url : 'http://'+url;
        url = (url.endsWith('/')) ? url : url += '/';
        endpoint = (endpoint.startsWith('/')) ? endpoint.replace('/', '') : endpoint;
        const finUrl = url + endpoint;
        const headers = (options["headers"]) ? options["headers"] : {};

        //TODO: If data has been preloaded or downloaded before, load the already downloaded data.
        
        request({
            url: finUrl,
            headers: headers
        }, function(error, response, body) {
            //Error cases
            if(error) cb(error);
            else if(response && response.statusCode == 400) cb('400 returned.');
            //TODO: Add more error cases (no body, error statusCodes, ...)
            else cb(undefined, body);
        })
    }

    //Set object methods with this
    this.fetch = fetch;
}

//Export ApiOptions function
module.exports = ApiOptions;
