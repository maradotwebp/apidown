# application specification & use-case

The application should provide a middleman for an API, in order to provide caching and local content. This will prevent downtime for static APIs, and improve access time for dynamic APIs.

For further clarification, read the following use-case, which describes what the Application SHOULD be able to do:

## Use case

A programmer would like to use apidown for a static API which requires a key authentication.

First, he imports apidown, sets the URL of the API, and includes the api key.
```javascript
const api = require('apidown')
api
    .url('www.sample-api.com')
    .key('MY_API_KEY')
```

To fetch a document, the programmer can specify an endpoint.
```javascript
api.fetch('/users', function(err, result) {
    console.log(result)
})
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

Further ideas/use-cases will be documented here.