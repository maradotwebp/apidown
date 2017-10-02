const demand = require('must');

describe('Main Entry point', function () {
    const api = require('./../lib/index.js');

    it('should be a ApiOptions function', function () {
        demand(api).must.be.a.function();
    });

    describe('with no auth', function () {
        const testApi = api('www.google.com');
        runTestsWithApi(testApi, 'search?q=javascript', 'test');
    });

    describe('with no auth - JSON return-capable', function() {
        const testApi = api('openlibrary.org');
        runTestsWithApi(testApi, 'api/books?bibkeys=ISBN:0201558025,LCCN:93005405&format=json', 'unavailable', true);
    });
});

/**
 * Dynamic create a fetch callback.
 */
function fetchFn(testApi, availableUrl, unavailableUrl, options, callbacks) {
    it("should callback when fetching (website available)", function (done) {
        testApi.fetch(availableUrl, function (err, result) {
            callbacks.cb(err, result);
            done();
        }, options);
    })
    it("should callback with error when fetching (website not available)", function (done) {
        testApi.fetch(unavailableUrl, function (err, result) {
            callbacks.noWebCb(err, result);
            done();
        }, options)
    })
    it("should callback when fetching cached result (website available)", function (done) {
        testApi.__addToCache(availableUrl, true);
        testApi.fetch(availableUrl, function (err, result) {
            callbacks.cacheCb(err, result);
            done();
        }, options);
    })
    it("should callback when fetching cached result (website not available)", function (done) {
        testApi.__addToCache(unavailableUrl, true);
        testApi.fetch(unavailableUrl, function (err, result) {
            callbacks.cacheNoWebCb(err, result);
            done();
        }, options);
    })
}

// Run all tests
function runTestsWithApi(testApi, availableUrl, unavailableUrl, endPointJsonReturnCapable=false) {

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
        fetchFn(testApi, availableUrl, unavailableUrl, {}, {
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
        fetchFn(testApi, availableUrl, unavailableUrl, { preferOnline: true }, {
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
        fetchFn(testApi, availableUrl, unavailableUrl, { headers: { 'User-Agent': 'request' } }, {
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

    // only test this if end point supports returning in JSOn
    if (endPointJsonReturnCapable) {
        describe('with Options: { parseJson: true }', function () {
            fetchFn(testApi, availableUrl, unavailableUrl, { preferOnline: true }, {
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
    }
}
