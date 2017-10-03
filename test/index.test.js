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

    describe('with no auth - JSON return-capable', function () {
        const testApi = api('openlibrary.org');
        runTestsWithApi(testApi, 'api/books?bibkeys=ISBN:0201558025,LCCN:93005405&format=json', 'unavailable', true);
    });
});


// Run all tests
function runTestsWithApi(testApi, availableUrl, unavailableUrl, endPointJsonReturnCapable = false) {

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

    describe("With API method", () => {
        it('should define an endpoint', (done) => {
            let endpoint = testApi.defineEndpoint("search", "GET");
            demand(endpoint).must.be.a.function();
            endpoint({ q: "javascript" }).then((resp) => {
                demand(resp).must.be.a.object();
                demand(resp.cache).must.be.false();
            });

            endpoint({ q: "html" }).then((resp) => {
                demand(resp).must.be.a.object();
                demand(resp.cache).must.be.false();
                done();
            }).catch(e => {
                console.log(e);
            });
        });

        it("should 'GET'", (done) => {
            testApi.get("search", "search");

            demand(testApi.search).to.be.a.function();
            testApi.search({ q: "javascript" }).then((resp) => {
                demand(resp).must.be.a.object();
                demand(resp.cache).must.be.false();
                done();
            });
        });

        it("should 'POST'", (done) => {
            let original = testApi.fetch;
            testApi.fetch = (endpoint, cb, config) => {
                demand(endpoint).to.equal("search");
                demand(config.method).to.equal("POST");
                cb(undefined, { test: true });
            };

            testApi.post("create_search", "search")
            testApi.create_search({ id: 1234 }).then(response => {
                demand(response.test).to.be.true();
                done();
            });

            testApi.fetch = original;
        });

        it("should 'DELETE'", (done) => {
            let original = testApi.fetch;
            testApi.fetch = (endpoint, cb, config) => {
                demand(endpoint).to.equal("search/1234");
                demand(config.method).to.equal("DELETE");
                cb(undefined, { test: true });
            };

            testApi.delete("create_search", "search/:id")
            testApi.create_search({ id: 1234 }).then(response => {
                demand(response.test).to.be.true();
                done();
            });

            testApi.fetch = original;
        });

        it("should 'PUT'", (done) => {
            let original = testApi.fetch;
            testApi.fetch = (endpoint, cb, config) => {
                demand(endpoint).to.equal("search/1234/bogus/444");
                demand(config.method).to.equal("PUT");
                cb(undefined, { test: true });
            };

            testApi.put("update_search", "search/:id/bogus/:test")
            testApi.update_search({ id: 1234, test: 444 }).then(response => {
                demand(response.test).to.be.true();
                done();
            });

            testApi.fetch = original;
        });

        it("should 'PATCH'", (done) => {
            let original = testApi.fetch;
            testApi.fetch = (endpoint, cb, config) => {
                demand(endpoint).to.equal("search/1234/bogus/444");
                demand(config.method).to.equal("PATCH");
                cb(undefined, { test: true });
            };

            testApi.patch("update_search", "search/:id/bogus/:test")
            testApi.update_search({ id: 1234, test: 444 }).then(response => {
                demand(response.test).to.be.true();
                done();
            });
            testApi.fetch = original;
        });

        it("should create a resource", () => {
            testApi.resource("users");
            demand(testApi.users).to.not.be.undefined();
            demand(testApi.users.find).to.be.a.function();
            demand(testApi.users.all).to.be.a.function();
            demand(testApi.users.create).to.be.a.function();
            demand(testApi.users.delete).to.be.a.function();
            demand(testApi.users.update).to.be.a.function();

            demand(testApi.users.find.url).to.be.equal("/users/:id");
            demand(testApi.users.all.url).to.be.equal("/users");
            demand(testApi.users.create.url).to.be.equal("/users");
            demand(testApi.users.delete.url).to.be.equal("/users/:id");
            demand(testApi.users.update.url).to.be.equal("/users/:id");
        });

        it("should find a resource endpoint", done => {
            let original = testApi.fetch;
            testApi.fetch = (endpoint, cb, config) => {
                demand(endpoint).to.equal("/users/1234");
                demand(config.method).to.equal("GET");
                cb(undefined, { test: true });
            };

            testApi.users.find({ id: 1234 }).then((resp) => {
                demand(resp.test).to.be.true();
                done();
            });

            testApi.fetch = original;
        });

        it("should get all resource endpoints", done => {
            let original = testApi.fetch;
            testApi.fetch = (endpoint, cb, config) => {
                demand(endpoint).to.equal("/users");
                demand(config.method).to.equal("GET");
                cb(undefined, { test: true });
            };

            testApi.users.all().then((resp) => {
                demand(resp.test).to.be.true();
                done();
            });

            testApi.fetch = original;
        });

        it('should create a resource endpoint', done => {
            let original = testApi.fetch;
            testApi.fetch = (endpoint, cb, config) => {
                demand(endpoint).to.equal("/users");
                demand(config.method).to.equal("POST");
                demand(config.body).to.equal("yessss");
                cb(undefined, { test: true });
            };

            testApi.users.create("yessss").then((resp) => {
                demand(resp.test).to.be.true();
                done();
            });

            testApi.fetch = original;
        });

        it("should delete the resource endpoint", done => {
            let original = testApi.fetch;
            testApi.fetch = (endpoint, cb, config) => {
                demand(endpoint).to.equal("/users/1234");
                demand(config.method).to.equal("DELETE");
                cb(undefined, { test: true });
            };

            testApi.users.delete({ id: 1234 }).then((resp) => {
                demand(resp.test).to.be.true();
                done();
            });

            testApi.fetch = original;
        });

        it("should update a resource endpoint", done => {
            let original = testApi.fetch;
            testApi.fetch = (endpoint, cb, config) => {
                demand(endpoint).to.equal("/users/1234");
                demand(config.method).to.equal("PUT");
                cb(undefined, { test: true });
            };

            testApi.users.update({ id: 1234 }).then((resp) => {
                demand(resp.test).to.be.true();
                done();
            });

            testApi.fetch = original;
        });

        it("should reject", done => {
            let original = testApi.fetch;
            testApi.fetch = (endpoint, cb, config) => {
                demand(endpoint).to.equal("/users/1234");
                demand(config.method).to.equal("PUT");
                cb(new Error("test"), undefined);
            };

            testApi.users.update({ id: 1234 }).then((resp) => {
                done(new Error("This shouldn't have been called"));
            }).catch(e => {
                demand(e.message).to.equal("test");
                done();
            });

            testApi.fetch = original;
        });

        it("should create base- and buildUrl", () => {
            demand(testApi.users.all.buildUrl()).to.equal("/users");
            demand(testApi.users.find.buildUrl({ id: 123 })).to.equal("/users/123");
            demand(testApi.users.create.buildUrl()).to.equal("/users");
        })
    });

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
}

describe("Test Api utils", () => {
    const api = require('./../lib/index.js');

    it("should create buildurl", () => {
        demand(api.buildUrl).must.be.a.function();
        let [url, payload] = api.buildUrl("/test/:id", { id: 1234 });
        demand(url).to.equal("/test/1234");
        demand(payload).to.be.empty();
        demand(() => {
            api.buildUrl("/test/:id/:fail", { id: 1234 });
        }).to.throw();

        [url, payload] = api.buildUrl("/test/:id/:test", { id: 1234, test: "yes", more: true, idk: false });

        demand(url).to.equal("/test/1234/yes");
        demand(payload).to.eql({ more: true, idk: false });

    });
})
