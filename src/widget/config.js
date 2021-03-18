System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "typescript",
  paths: {
    "npm:*": "jspm_packages/npm/*",
    "node_modules*": "node_modules/*",
    "github:*": "jspm_packages/github/*"
  },

  packages: {
    "app": {
      "format": "register",
      "defaultExtension": "js"
    }
  },

  map: {
    "angular2": "node_modules/angular2",
    "jquery": "node_modules/jquery",
    "jquery.payment": "node_modules/jquery.payment",
    "rxjs": "node_modules/rxjs",
    "semantic-ui-css": "node_modules/semantic-ui-css",
    "typescript": "npm:typescript@1.8.9",
    "github:jspm/nodelibs-os@0.1.0": {
      "os-browserify": "npm:os-browserify@0.1.2"
    },
    "npm:os-browserify@0.1.2": {
      "os": "github:jspm/nodelibs-os@0.1.0"
    },
    "npm:typescript@1.8.9": {
      "os": "github:jspm/nodelibs-os@0.1.0"
    }
  }
});
