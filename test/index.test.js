const demand = require('must');


describe('Main Entry point', function() {

    describe('with no auth', function() {
        const api = require('./../lib/index.js');
        const testApi = api('www.google.com');

        it('should be a function', function() {
            demand(api).must.be.a.function();
        })

        it('should return an ApiObject', function() {
            demand(testApi).must.be.a.object();
        })

        testApi.output();
    })
    
})