# apidown [![Build Status](https://travis-ci.org/froehlichA/apidown.svg?branch=master)](https://travis-ci.org/froehlichA/apidown) [![Coverage Status](https://coveralls.io/repos/github/froehlichA/apidown/badge.svg?branch=master)](https://coveralls.io/github/froehlichA/apidown?branch=master)
:arrow_double_down: A middleman for APIs. Download, cache, get 100% uptime.

## History
This application is beginner-friendly, and made for [Hacktoberfest 2017](https://hacktoberfest.digitalocean.com/), and should serve as a starting point for javascript open-source developers.

If you would like to contribute, follow [Contributing.md](CONTRIBUTING.md).

## Documentation
You can register an api with the following commands:
```javascript
const api = require('apimust');
const testapi = api.url('www.sample-api.com') //Root url of the api
testapi
    .withPassword('CLEAN_TEXT_PASSWORD') //Add password auth
    .withHeaders({ 'User-Agent': 'mozilla' }) //Custom http headers
```
Then, you can use apimust to fetch data from the server, and automatically cache data in the process.
```javascript
//Fetches the body of www.sample-api.com/users, and saves the data in the cache.
testapi.fetch('/users', function(err, result) {
    if(err) console.log(err);
    if(result) console.log(result);
})

//Using fetch on the same endpoint will fetch from cache now, and load much faster on slow connections.
testapi.fetch('/users', function(err, result) {
    if(err) console.log(err);
    if(result) console.log(result);
})
```

You can also integrate options into the ```fetch``` method:
```javascript
const options = {
    preferOnline: true //Will try to fetch online first, and resort to cache as a fallback
    headers: {
        'User-Agent': 'mozilla' //Will add custom headers
    }
}

testapi.fetch('/users', function(err, result) {
    if(err) console.log(err);
    if(result) console.log(result);
}, options)
```
