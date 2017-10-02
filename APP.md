# application specification & use-case

The application should provide a middleman for an API, in order to provide caching and local content. This will prevent downtime for static APIs, and improve access time for dynamic APIs.

For further clarification, read the following use-case, which describes what the Application SHOULD be able to do:

## Use case

A programmer would like to use apidown for a static API which requires a key authentication.

First, he imports apidown, sets the URL of the API, and includes the api key.
```javascript
const api = require('apidown')
api('www.sample-api.com')
    .key('MY_API_KEY')
```

To fetch a document, the programmer can specify an endpoint.
```javascript
api.fetch('/users', function(err, result) {
    console.log(result)
})
```
The user should also be able to define preexsiting urls and have a method that corresponds to the request. These methods should use promises as well. For example: 
```javascript
api.get("users", "/users")
    .get("single_user", "/users/:id");
    .post("create_user", "/users");
```
Would result in 
```javascript
api.users(); //sends a get request to /users
api.single_user({id: 1234}); //sends a get request to /users/1234
api.create_user({...}) //sends a post to create a user at /users
```
To simplify the process, users should also be able to call a `resource` method.
```javascript
api.resource("users");
```
results in
```javascript
api.users.getAll(); //send GET to /users
api.users.get({id: 1234}); //sends a GET request to /users/1234
api.users.update({id: 1234, ...}); //sends a PUT request to /users/1234
api.users.create({...}); //sends a POST request to /users
api.users.delete({id: 1234}); //sends a DELETE request to /users/1234
```
Apidown should now:
- check if www.sample-api.com/users is up
- check if content from website has already been downloaded
- If content has been downloaded:
    - return the content of the downloaded file
- If content has not been downloaded:
    - store the content of www.sample-api.com/users
    - return the content of the downloaded file

## Further use cases
Other possibilities for apidown could include:
- Authentication with oauth
- online first (fallback to local if online not available)
    - for dynamic APIs
- store the content in a file
- preload files with an regexp, to make apidown suitable for production
- check the freshness of the data that is already captured

Further ideas/use-cases will be documented here.
