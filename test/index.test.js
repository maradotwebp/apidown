const demand = require('must');

describe('Main Entry point', function() {
    describe('with no auth', function() {
        const api = require('./../lib/index.js');
        const testApi = api('www.google.com');

        it('should be a ApiOptions function', function() {
            demand(api).must.be.a.function();
        });

        it('should return an ApiObject', function() {
            demand(testApi).must.be.a.object();
        });

        describe(': apiObject', function() {
            
            it('should have a fetch method', function() {
                demand(testApi.fetch).must.be.a.function();
            });

            it('should return result when fetch method is called correctly', function(done) {
                testApi.fetch('search?q=javascript', function(err, result) {
                    demand(result).must.be.a.object();
                    demand(result.data).must.be.a.string();
                    done();
                });
            });

            it('should return cached result when fetch method is called a second time', function(done) {
                testApi.fetch('search?q=javascript', function(err, result) {
                    demand(result).must.be.a.object();
                    demand(result.data).must.be.a.string();
                    demand(result.cache).must.be.true();
                    done();
                });
            });

            it('should callback with error when fetch method is called incorrectly', function(done) {
                testApi.fetch('test', function(err, result) {
                    demand(err).must.be.an.error();
                    demand(result).must.be.undefined();
                    done();
                });
            });

            it("should prefer online", (done) => {
                testApi.fetch('search?q=javascript', function(err, result) {
                    demand(result).must.be.a.object();
                    demand(result.data).must.be.a.string();
                    demand(result.cache).must.be.false();
                    done();
                }, {preferOnline: true});
            });

            it("should prefer online and work on error", (done) => {
                testApi.__addToCache("test", true);

                testApi.fetch('test', function(err, result) {
                    demand(err).must.be.undefined();
                    demand(result).must.be.a.object();
                    demand(result.cache).must.be.true();
                    demand(result.data).must.be.true();     
                    done();
                }, {preferOnline: true});
            });

        });
    });
});
