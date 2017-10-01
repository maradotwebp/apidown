const demand = require('must');
const expect = require('must');

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
                demand(testApi.fetch).must.be.function();
            });

            it('should return result when fetch method is called correctly simple', function() {
                testApi.fetch('search?q=javascript', function(err, result) {
                    demand(result).to.be.object();
                });
            });

            it('should return result when fetch method is called multiple correctly ', function(done) {
                testApi.fetch('search?q=javascript', function(err, result) {
                    demand(result).to.be.object();

                    testApi.fetch('search?q=csharp', function(err, result) {
                        demand(result).to.be.object();

                        testApi.fetch('search?q=javascript', function(err, result) {
                            demand(result).to.be.object();
                            expect(result.fromCache).to.equal(true);
                            done();
                        });
                    });
                });
            });

            it('should callback with error when fetch method is called incorrectly', function() {
                testApi.fetch('test', function(err, result) {
                    demand(err).to.be.error();
                    demand(result).to.be.undefined();
                });
            });
        });
    });
});
