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

      describe('with api key', function () {
          const URL = 'https://maps.googleapis.com/maps/api/geocode/'
          const testApi = api(URL);
          const API_KEY = 'YOUR_KEY'

          testApi.password(API_KEY)

          describe('password', function () {
              it('should enable authentication', function () {
                demand(testApi.defaultOptions.authentication.enabled).must.be.truthy()
              });

              it('should add key to defaultOptions', function () {
                demand(testApi.defaultOptions.authentication.text).must.be.equal(API_KEY)
              });
            })

            it("should callback when fetching", function (done) {
              testApi.fetch('json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA', function (err, result) {
                // Google Maps do not return any error status code if the API key is wrong,
                // they create a custom message in the data field
                const res = JSON.parse(result.data)
                demand(res.error_message).must.be.undefined();
                done()
              }, {});
            })
          })
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
          cb: (done, err, result) => {
            demand(err).must.be.undefined();
            demand(result.cache).must.be.false();
            demand(result.data).must.be.truthy();
          },
          noWebCb: (done, err, result) => {
            demand(err).must.be.error();
            demand(result).must.be.undefined();
          },
          cacheCb: (done, err, result) => {
            demand(err).must.be.undefined();
            demand(result.cache).must.be.true();
            demand(result.data).must.be.truthy();
          },
          cacheNoWebCb: (done, err, result) => {
            demand(err).must.be.undefined();
            demand(result.cache).must.be.true();
            demand(result.data).must.be.truthy();
          },
        });
      })

      describe('with Options: { preferOnline: true }', function () {
        dynamicFetch({
          preferOnline: true
        }, {
          cb: (done, err, result) => {
            demand(err).must.be.undefined();
            demand(result.cache).must.be.false();
            demand(result.data).must.be.truthy();
          },
          noWebCb: (done, err, result) => {
            demand(err).must.be.error();
            demand(result).must.be.undefined();
          },
          cacheCb: (done, err, result) => {
            demand(err).must.be.undefined();
            demand(result.cache).must.be.false();
            demand(result.data).must.be.truthy();
          },
          cacheNoWebCb: (done, err, result) => {
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
            callbacks.cb(done, err, result);
            done();
          }, options);
        })
        it("should callback with error when fetching (website not available)", function (done) {
          testApi.fetch('test', function (err, result) {
            callbacks.noWebCb(done, err, result);
            done();
          }, options)
        })
        it("should callback when fetching cached result (website available)", function (done) {
          testApi.__addToCache('search?q=javascript', true);
          testApi.fetch('search?q=javascript', function (err, result) {
            callbacks.cacheCb(done, err, result);
            done();
          }, options);
        })
        it("should callback when fetching cached result (website not available)", function (done) {
          testApi.__addToCache('test', true);
          testApi.fetch('test', function (err, result) {
            callbacks.cacheNoWebCb(done, err, result);
            done();
          }, options);
        })
      }
    }
