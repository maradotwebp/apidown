const demand = require('must');

describe('Main Entry point', function () {
    const api = require('./../lib/index.js');

    describe('with no auth', function () {
        const testApi = api('www.google.com');

        it('should be a ApiOptions function', function () {
            demand(api).must.be.a.function();
        });

        it('should return an ApiObject', function () {
            demand(testApi).must.be.a.object();
        });

        it('should have a fetch method', function () {
            demand(testApi.fetch).must.be.a.function();
        });

        runTestsWithApi(testApi);
    });
});

//Runs all tests with specified API.
function runTestsWithApi(testApi) {
    beforeEach(function () {
        testApi.__clearCache();
    })

    describe('with Options: {}', function () {
        dynamicFetch({},
            (done) => done(),
            (done, err, result) => {
                demand(result.cache).must.be.true();
                done();
            },
            (done) => done()
        );
    })

    describe('with Options: { preferOnline: true }', function () {
        dynamicFetch({ preferOnline: true },
            (done) => done(),
            (done, err, result) => {
                demand(result.cache).must.be.false();
                done();
            },
            (done) => done()
        );
    })

    //Fetch automatically with options, for normal, cached, and error
    function dynamicFetch(options, cb, cacheCb, errorCb) {
        it("should callback when fetching normally", function(done) {
            testApi.fetch('search?q=javascript', function (err, result) {
                demand(err).must.be.undefined();
                demand(result.cache).must.be.false();
                demand(result.data).must.be.truthy();
                cb(done, err, result);
            }, options);
        })
        it("should callback when fetching cached result", function(done) {
            testApi.__addToCache('search?q=javascript', true);
            testApi.fetch('search?q=javascript', function (err, result) {
                demand(err).must.be.undefined();
                demand(result.data).must.be.truthy();
                cacheCb(done, err, result);
            }, options);
        })
        it("should callback with error when cached & online not available", function(done) {
            testApi.fetch('test', function(err, result) {
                demand(err).must.be.error();
                demand(result).must.be.undefined();
                errorCb(done, err, result);
            }, options)
        })
    }
}
