## Synopsis

Sedra widget is a project where people embed a campaign right into their own website

## Installation

To install, run "npm install" to get all the dependencies

To play around with this, that is to debug and take a look on your machine,
run "npm run play". It will be running on "localhost:8080"

## Building

To compile and get the code for production, run "npm run build"
This will compile the TypeScript code, bundle Angular2 dependencies, and concat with other JS files that are needed for this project. The files will be in folder "production"

The API_HOST in Constants-Global.ts would need to be changed to target local server as well

To embed, you only need to put the sample HTML code below onto your site.
getwidget.js will parse the site and check the app_local.js for server URL.
It will then start checking if jQuery and Semantic UI js exist and will pull them in if not present. 
Finally, it starts pulling es6 polyfills and the actual widget code. 
The `<script>` tag is outside of `<sedra-widget>` is because I think angular2 will replace everything in `<sedra-widget>` when it starts rendering

A sample HTML markup would look like:

```html
<div>
  <sedra-widget campaignid="1" themecolor="#F44336" fontcolor="#616161" fontfamily="Helvetica">
    <div class="ui basic segment widget-loader">
      <div class="ui large text active loader"></div>
    </div>
  </sedra-widget>
  <script type="text/javascript" src="https://origin.thrinacia.com/widget/production/getwidget.js"></script>
</div>
```
## COMPILING SASS/CSS CHANGES

Use the command sass --watch for a live reload of your sass/css changes. Example: 

sass --watch app/sass/main.scss:app/css/main.css

## ATTRIBUTES

campaignid (Required): This is the ID of the campaign you would like to embed into your site

themecolor (Optional): This defines the color of progress bar, some buttons, and some other hover effect. If not present, there will be a default used in the widget

fontcolor (Optional): This defines the color of the important texts. Contents that are shown in fr-view won't be affected as they are controlled by Froala Editor. If not present, there will be a default

fontfamily (Optional): This defined the font family being used for the whole widget except for fr-view which won't be affected as they are controlled by Froala Editor. If not present, there will be a default

## Dependencies

* Angular2 2.3.0
* Semantic UI 2.1.8
* jQuery 2.2.4
* TypeScript 2.1.4
* Webpack 2.1.0-beta.27
* Webpack dev server 2.1.0-beta.12
* Froala Editor 2.3.5 Unmodified (For Style)

## Atlas Deployment

For every update in this widget, make sure to build everything then copy everything in the git repo root to a folder called "widget" in core webui repo under src folder.
Follow the deployment procedure in the core webui repo for normal deployment process (gulp build, etc.)
