## Synopsis

Sedra widget is a project where people embed a campaign right into their own website

# Installation
`npm install` and `gulp` to start local web server

# Setup
This application requires an `app_local.js` which acts as an `.env` file.  An example file has been provided in the repo called app_local.js.example.

## Trulioo Authentication Service
In an external folder, run `git clone git@ark.thrinacia.com:thrinacia-proxy-tools` and follow the instructions to turn on the service.
The `identity_proxy_url` option in `app_local.js` points to the location of the running service.
```
app.constant('API_URL', {
  url: "https://your.thrinacia.website.com",
  loc: '/service/restv1/',
  identity_proxy_url: "http://localhost:8000"
});  
```

# Running the application
`gulp`
