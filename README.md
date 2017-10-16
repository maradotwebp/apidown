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
```

You can set `options.parseJson` to `true` in order to automatically parse return body as JSON object.  

In case your input endpoint doesnt capable to return JSON format, the underlying system will handle error case and normally return error.

```javascript
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

## `defineEndpoint`
You can define an endpoint, which will return a function tied to a URL endpoint.
### parameters
The parameters are:

    1. url: the Url for the endpoint
    2. method: the method for the endpoint ("GET", "POST", "PUT", "DELETE" or "PATCH")
    3. headers: the headers for the endpoint (_optional_)
    4. config: the config for this endpoint (_optional_)
### Return
This returns a function that sends a request to the endpoint. This function takes the following parameters:

    1. payload: this is the payload for the request (This is also used for formating the url)
    2. headers: the headers for this request(_optional_)
    3. config: The config for this request (_optional_)

### Example
```javascript
let endpoint = testApi.defineEndpoint("/users/:id", "GET");

//sends a request to /users/1234?example=yes
endpoint({id: 1234, example: "yes"})
.then(data => console.log(data))
.catch(err => console.error(err))
```

## Predefined endpoint functions (`get`, `post`, `delete`, `update`)
You could also predefine api endpoints so that it is on the api object.
### parameters
These are the parameters this takes

    1. name: the name of the method
    2. url: the Url for the endpoint
    3. method: the method for the endpoint ("GET", "POST", "PUT", "DELETE" or "PATCH")
    4. headers: the headers for the endpoint (_optional_)
    5. config: the config for this endpoint (_optional_)

### Return
This returns the API object with new methods that corresponds to the name you gave it.
this method takes all of the same parameters as `defineEndpoint`.

### Example
```javascript
testApi.get("all_users", "/users");
    .post("create_user", "/users");
    .get("single_user", "/users/:id");
    .update("update_user", "/users/:id");
    .delete("delete_user", "/users/:id");
```

This will attach these methods to `testApi`.
```javascript
testApi.all_users(); //Sends a GET request to /users
testApi.create_user({...}); //Sends a POST request to /users
testApi.single_user({id: 1234}); //sends a GET request to /users/1234
```

## Resources
Instead of defining each individual endpoint you can define a resource, which will attach appropiate methods to your endpoint.

### Parameters
This takes the following parameters:

    1. name: the name of the resource. this could also be the base url
    2. methods: the methods this resource supports. (_optional_) defualts to ["GET", POST", "PUT", "DELETE"]
    3. headers: the headers for this resource
    4. config: the config for this resource
    5. base_url: the base_url for this resource, defaults to "name"
    6. key: the key for the resource. Defaults to the "id".

### Returns
This returns an object that has methods that sends out requests. These methods are `find`, `all`, `delete`, `create`, and `update` and are the same as described in the *Predefined endpoint functions* section.

### Example 
```javascript
//Creates a resource called users
testApi.resource("users");
```

This creates five methods on a `users` object on `testApi`: `find`, `all`, `delete`, `create`, and `update`. For example:
```javascript
testApi.users.all(); //sends a GET request to /users
testApi.users.find({id: 1234}); //sends a GET request to /users/1234
testApi.users.create({...}); //sends a POST request to /users
testApi.users.delete({id: 1234}) //sends a DELETE request to /users/1234
testApi.users.update({id: 1234, ...}) //sends a PUT/PATCH request to /users/1234
```
