/*
    Entry point of application.
    Returned with:
        const api = require('apidown')
        const testApi = api('www.sample-api.com')
*/
function Api(url) {
    this.url = url;

    //Returns new ApiObject
    if(!(this instanceof Api)) return new Api(url);
}

//Export Api function
module.exports = Api;