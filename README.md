## Synopsis

Thrinacia Crowdfunding Web UI v1

# Installation
`npm install` and `gulp` to start local web server

# Setup
This application requires an `app_local.js` which acts as an `.env` file.  An example file has been provided in the repo called src/app_local.js.example.
The angapp directory is where src application is built

# Trulioo Authentication Service (Optional)
The `identity_proxy_url` option in `app_local.js` points to the location of the trulioo proxy service.
```
app.constant('API_URL', {
  url: "https://your.thrinacia.website.com",
  loc: '/service/restv1/',
  identity_proxy_url: "http://localhost:8000"
});  
```

# Building the application
`gulp build`
