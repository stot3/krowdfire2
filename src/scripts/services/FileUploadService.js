app.service('FileUploadService', function ($q, $upload, $timeout, API_URL) {
  var fileUpload = {};
  var prog;

  // Prevent the dimmer from closing with a mouse click
  $('.imagePlace .dimmer').dimmer({
    closable: false
  });

  // this function upload file to a disignated endpoint with method and file and param
  fileUpload.upload = function (endpoint, files, params, node) {
    var upload_endpoint = API_URL.url + API_URL.loc + endpoint;
    var promises = [];
    node.find('.imagePlace .dimmer').dimmer({
      closable: false
    }).dimmer('show');
    $('.ui.progress.download-loader').hide();
    // $('.imagePlace .dimmer').dimmer({closable: false}).dimmer('show');
    $('.ui.progress.upload-bar').fadeIn();
    for (var i = 0; i < files.length; i++) {
      // adding resource param
      params.resource = files[i];
      // angular file upload service $upload
      var result = $upload.upload({
        url: upload_endpoint,
        method: 'POST',
        headers: {},
        useXDomain: true,
        data: params
      });
      result.then(function (success) {
        // (success);
      }, function (failure) {
        // (failure);
      }, function (evt) {
        loadProgress(evt.loaded, evt.total);
      });
      promises.push(result);
    }
    return $q.all(promises);
  };

  fileUpload.modify = function (endpoint, files, params, id, node) {
    var upload_endpoint = API_URL.url + API_URL.loc + endpoint + id;
    var promises = [];
    node.find('.imagePlace .dimmer').dimmer({
      closable: false
    }).dimmer('show');
    $('.ui.progress.download-loader').hide();
    $('.ui.progress.upload-bar').show();
    for (var i = 0; i < files.length; i++) {
      // adding resource param
      params.resource = files[i];
      // angular file upload service $upload
      var result = $upload.upload({
        url: upload_endpoint,
        method: 'PUT',
        headers: {},
        useXDomain: true,
        data: params
      });
      result.then(function (success) {
        // (success);
      }, function (failure) {
        // (failure);
      }, function (evt) {
        loadProgress(evt.loaded, evt.total);
      });
      promises.push(result);
    }

    return $q.all(promises);
  };

  function loadProgress(loaded, total) {
    prog = parseInt(100.0 * loaded / total);
    $('.ui.progress.upload-bar').progress({
      percent: prog,
      total: 100
    });
    if (prog == 100) {
      $('.ui.progress.upload-bar').fadeOut('slow');
      $('.ui.loader.download-loader').fadeIn('slow');
      prog = 0;
    }
  }

  fileUpload.uploadFile = function (endpoint, files) {
    if (files.length) {
      var uploadEndpoint = API_URL.url + API_URL.loc + endpoint;
      var params = {
        "resource_type": "file",
        "resource_content_type": "generic",
        "resource": files[0]
      };

      var upload = $upload.upload({
        url: uploadEndpoint,
        method: 'POST',
        headers: {},
        useXDomain: true,
        data: params
      });

      return upload;
    }

    return null;
  }

  return fileUpload;
});