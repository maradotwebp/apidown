//Importing request
const request = require('request');

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
function Api() {
    
    //Calls the endpoint and returns the body.
    function fetch(endpoint, cb) {
        //Avoid wrong input.
        url = (url.startsWith('http')) ? url : 'http://'+url;
        url = (url.endsWith('/')) ? url : url += '/';
        endpoint = (endpoint.startsWith('/')) ? endpoint.replace('/', '') : endpoint;
        const finUrl = url + endpoint;

        //TODO: If data has been preloaded or downloaded before, load the already downloaded data.

        request(finUrl, function(error, response, body) {
            if(error) cb(error);
            else if(response && response.statusCode == 400) cb('400 returned.');
            //TODO: Add more fallbacks
            else cb(undefined, body);
        })
    }

    //Set methods
    this.fetch = fetch;
}

//Export ApiOptions function
module.exports = ApiOptions;