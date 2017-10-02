const demand = require('must');

describe('Main Entry point', function () {
    const api = require('./../lib/index.js');

    it('should be a ApiOptions function', function () {
        demand(api).must.be.a.function();
    });

    describe('with no auth', function () {
        const testApi = api('www.google.com');
        runTestsWithApi(testApi);
    });
});

//Runs all tests with specified API.
function runTestsWithApi(testApi) {
    beforeEach(function () {
        testApi.__clearCache();
    })

    it('should return an ApiObject', function () {
        demand(testApi).must.be.a.object();
    });

    it('should have a fetch method', function () {
        demand(testApi.fetch).must.be.a.function();
    });


    describe('with Options: {}', function () {
        dynamicFetch({}, {
            cb: (err, result) => {
                demand(err).must.be.undefined();
                demand(result.cache).must.be.false();
                demand(result.data).must.be.truthy();
            },
            noWebCb: (err, result) => {
                demand(err).must.be.error();
                demand(result).must.be.undefined();
            },
            cacheCb: (err, result) => {
                demand(err).must.be.undefined();
                demand(result.cache).must.be.true();
                demand(result.data).must.be.truthy();
            },
            cacheNoWebCb: (err, result) => {
                demand(err).must.be.undefined();
                demand(result.cache).must.be.true();
                demand(result.data).must.be.truthy();
            },
        });
    })

    describe('with Options: { preferOnline: true }', function () {
        dynamicFetch({ preferOnline: true }, {
            cb: (err, result) => {
                demand(err).must.be.undefined();
                demand(result.cache).must.be.false();
                demand(result.data).must.be.truthy();
            },
            noWebCb: (err, result) => {
                demand(err).must.be.error();
                demand(result).must.be.undefined();
            },
            cacheCb: (err, result) => {
                demand(err).must.be.undefined();
                demand(result.cache).must.be.false();
                demand(result.data).must.be.truthy();
            },
            cacheNoWebCb: (err, result) => {
                demand(err).must.be.undefined();
                demand(result.cache).must.be.true();
                demand(result.data).must.be.truthy();
            },
        });
    })

    describe('with Options: { headers: { "User-Agent": "request" } }', function () {
        dynamicFetch({ headers: { 'User-Agent': 'request' } }, {
            cb: (err, result) => {
                demand(err).must.be.undefined();
                demand(result.cache).must.be.false();
                demand(result.data).must.be.truthy();
            },
            noWebCb: (err, result) => {
                demand(err).must.be.error();
                demand(result).must.be.undefined();
            },
            cacheCb: (err, result) => {
                demand(err).must.be.undefined();
                demand(result.cache).must.be.true();
                demand(result.data).must.be.truthy();
            },
            cacheNoWebCb: (err, result) => {
                demand(err).must.be.undefined();
                demand(result.cache).must.be.true();
                demand(result.data).must.be.truthy();
            },
        });
    })

    //Fetch automatically with all four cases.
    function dynamicFetch(options, callbacks) {
        it("should callback when fetching (website available)", function (done) {
            testApi.fetch('search?q=javascript', function (err, result) {
                callbacks.cb(err, result);
                done();
            }, options);
        })
        it("should callback with error when fetching (website not available)", function (done) {
            testApi.fetch('test', function (err, result) {
                callbacks.noWebCb(err, result);
                done();
            }, options)
        })
        it("should callback when fetching cached result (website available)", function (done) {
            testApi.__addToCache('search?q=javascript', true);
            testApi.fetch('search?q=javascript', function (err, result) {
                callbacks.cacheCb(err, result);
                done();
            }, options);
        })
        it("should callback when fetching cached result (website not available)", function (done) {
            testApi.__addToCache('test', true);
            testApi.fetch('test', function (err, result) {
                callbacks.cacheNoWebCb(err, result);
                done();
            }, options);
        })
    }
}
