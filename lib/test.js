const api = require('./index.js');
const testApi = api('www.google.com');

testApi.fetch('search?q=javascript', function(err, result) {
    console.log('demand(result).to.be.object()');

    testApi.fetch('search?q=javascript', function(err, result) {
        console.log('demand(result).to.be.object()');
    });
});
