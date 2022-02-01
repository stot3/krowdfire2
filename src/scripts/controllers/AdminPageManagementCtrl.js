//------------------------------------------------------
//         PAGE MANAGEMENT / PAGE CONTROLLER
//------------------------------------------------------
app.controller('AdminPagesCtrl', function ($scope, $rootScope, $timeout, $location, $upload, Restangular, $translatePartialLoader, $translate, API_URL) {
  var contactFormHTML = '<div class="ui form basic segment contact-form"> \
  <div class="ui page dimmer contact-success-dimmer"> \
  <div class="content"> \
  <div class="center"> Your message has been sent successfully.</div> \
  </div> \
  </div> \
  <div class="field"> \
  <label for=""> Full Name </label>\
  <div class="ui icon input field-name">\
  <input type="text" name="name" ng-model="formData.name">\
  <div class="ui corner label">\
  <i class="icon asterisk"></i>\
  </div>\
  </div>\
  </div>\
  <div class="field">\
  <label for=""> Email </label>\
  <div class="ui icon input field-email">\
  <input type="email" name="email" ng-model="formData.email">\
  <div class="ui corner label">\
  <i class="icon asterisk"></i>\
  </div>\
  </div>\
  </div>\
  <div class="field field-business">\
  <label for=""> Business/Organization </label>\
  <input type="text" placeholder="Optional" ng-model="formData.business_organization ">\
  </div>\
  <div class="field field-phone">\
  <label for=""> Phone Number </label>\
  <input type="text" placeholder="Optional" ng-model="formData.phone">\
  </div>\
  <div class="field field-message">\
  <label for=""> Message </label>\
  <div class="ui icon input">\
  <textarea name="description" id="" cols="30" rows="10" ng-model="formData.description"></textarea>\
  <div class="ui corner label">\
  <i class="icon asterisk"></i>\
  </div>\
  </div>\
  </div>\
  \
  <div class="ui teal submit button"> Send </div>\
  </div>';

  $scope.clearMessage = function () {
    $rootScope.floatingMessage = [];
  }
  var msg = [];
  $scope.froalaOptionsPages = {};
  $scope.metaTypes = ["name", "charset", "http-equiv", "property"];

  function initiateOptions(foption) {
    for (var prop in $rootScope.froalaOptions) {
      if ($rootScope.froalaOptions.hasOwnProperty(prop)) {
        foption[prop] = $rootScope.froalaOptions[prop];
      }
    }
  }

  initiateOptions($scope.froalaOptionsPages);

  $scope.froalaOptionsPages.events["froalaEditor.commands.after"] = function (e, editor, cmd) {
    if (cmd == "html") {
      $rootScope.inHTMLMode += 1;
    }
  }

  $scope.goBack = function () {
    $scope.pageShown = false;
    $scope.listMeta = [];
    if ($rootScope.inHTMLMode % 2 == 1) {
      $scope.froalaOptionsPages.froalaEditor("codeView.toggle");
      $rootScope.inHTMLMode = 0;
    }
    $scope.isReservedPage = false;
  }

  $scope.editReservedPage = function (page) {
    $scope.page = page;
    $scope.old_path = page.path;
    $scope.pageShown = true;
    $scope.pageSectionTitle = "tab_pages_editpage";
    $scope.pageEditType = "edit";
    $scope.page.disable = true;
    $scope.isReservedPage = true;
  }

  $scope.editPage = function ($event, page) {
    $rootScope.inHTMLMode = 0;
    $scope.page = page;
    $scope.old_path = page.path;
    $scope.pageShown = true;
    $scope.pageSectionTitle = "tab_pages_editpage";
    $scope.pageEditType = "edit";
    $scope.page.disable = false;
    if ($scope.widget_index == undefined) {
      $("button.widgets").addClass("disabled");
    }
    $(".page-content").prev().find(".fr-view").focus();
    $scope.isReservedPage = false;
  }

  $scope.widget_options = {};
  $scope.showWPOptions = function () {
    $('.post-list-options').modal('show');
  }

  $scope.showTwitterOptions = function () {
    $('.twitter-widget-options').modal('show');
  }

  String.prototype.splice = function (idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
  };

  $scope.setWidgetIndex = function (index) {
    $scope.widget_index = index;
    if ($scope.widget_index != undefined) {
      $("button.widgets").removeClass("disabled");
    }
  }

  function insertIntoCodeView(text) {
    var $codemirror = $(".CodeMirror")[0].CodeMirror;
    $codemirror.replaceSelection(text);
  }

  // Listen to the froala editor initialized event and binding an external button to insert HTML
  $scope.froalaOptionsPages.events["froalaEditor.initialized"] = function (e, editor) {
    editor.events.bindClick($('body'), 'button.widgets', function () {
      // fr-code-view class is added when it's in code view
      if ($rootScope.inHTMLMode % 2 == 0) {
        editor.undo.saveStep();
        // Insert contact form
        if ($scope.widget_index == 1) {
          editor.html.insert(contactFormHTML);
        }
        // Insert post HTML
        else if ($scope.widget_index == 2) {
          var text = "<wp-post-list>__WordPress__</wp-post-list>";
          editor.html.insert(text);
        } else if ($scope.widget_index == 3) {
          editor.html.insert(getTwitterWidget());
        }
        editor.undo.saveStep();
      } else if ($rootScope.inHTMLMode % 2 == 1) {
        // Insert contact form
        if ($scope.widget_index == 1) {
          insertIntoCodeView(contactFormHTML);
        }
        // Insert post HTML
        else if ($scope.widget_index == 2) {
          var text = "<wp-post-list>__WordPress__</wp-post-list>";
          insertIntoCodeView(text);
        } else if ($scope.widget_index == 3) {
          insertIntoCodeView(getTwitterWidget());
        }
      }
    });
  }

  function getTwitterWidget() {
    var text = $scope.public_settings.site_widget_twitter_widget_code;
    if ($scope.widget_options.tweet_limit) {
      var tmp = 'data-tweet-limit="' + $scope.widget_options.tweet_limit + '" ';
      var idx = text.indexOf('href');
      if (idx > 0) {
        text = text.splice(idx, 0, tmp);
      }
    }
    return text;
  }

  // Check if document.write exists in the code, if so throw an error msg
  function isDocumentWrite(htmlBlock) {
    if (htmlBlock && htmlBlock.match(/document.write/g)) {
      msg = {
        'header': 'document_write_prompt_msg',
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      return true;
    }
    return false;
  }

  $scope.confirmPageEdit = function ($event) {
    // contentChanged gets called when events form.submit is fired
    $scope.froalaOptionsPages.froalaEditor("events.trigger", "form.submit", [], true);
    //$scope.clearMessage();
    $event.preventDefault();
    $formData = {};
    angular.copy($scope.page, $formData);

    // Grab content manually since the froala update doesn't alway register 
    //$scope.testinit();
    $formData.content = $scope.froalaOptionsPages.froalaEditor('html.get');
    //$('#page-view-form').form('validate form');
    if ($formData.path == $scope.old_path) {
      delete $formData['path'];
    }
    if ($formData.content) {
      $formData.content = $formData.content.replace(/&#10;/g, '');
      $formData.content = $formData.content.replace(/&#9;/g, '');
      $formData.content = $formData.content.replace(/&#8;/g, '');
      $formData.content = $scope.replaceInsideStyleTag($formData.content);
    }

    if ($formData.name && $formData.id) {
      msg = {
        'loading': true,
        'loading_message': 'in_progress'
      }
      $rootScope.floatingMessage = msg;

      $scope.isCodeValid = !isDocumentWrite($formData.content);

      if ($scope.isCodeValid) {
        Restangular.one('portal').one('page').all($formData.id.toString()).customPUT($formData).then(
          function (success) {
            $.each($scope.pages, function (key, value) {
              if (value && value['id'] == success[0]['id']) {
                $scope.pages[key] = success[0];
                $scope.pages[key].content = $scope.replaceStyleTag($scope.pages[key].content);
              }
            });
            $translate(['Page', 'modified']).then(function (value) {
              $scope.p = value.Page;
              $scope.modified = value.modified;
              msg = {
                'header': $scope.p + " " + success[0].name + " " + $scope.modified
              }
              $rootScope.floatingMessage = msg;
              $scope.hideFloatingMessage();
            });
          },
          function (failure) {
            msg = {
              'header': failure.data.message
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
          }
        );
      }
    } else {
      msg = {
        'header': 'tab_pages_editpage_pagename_validation'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }
  }

  function backToTop() {
    $('html,body').animate({
      scrollTop: 0
    }, 800);
  }

  $scope.testinit = function () {
    $translate(['tab_pages_editpage_pagename_validation']).then(function (translation) {
      $('#page-view-form.ui.form').form({
        page_name: {
          identifier: 'page_name',
          rules: [{
            type: 'empty',
            prompt: translation.tab_pages_editpage_pagename_validation
          }]
        }
      }, {
          inline: true,
          onSuccess: function () {
            $scope.formValCheck = true;
          },
          onFailure: function () {
            $scope.formValCheck = false;
          }
        }).form('validate form');
    });
  }

  $scope.addPage = function ($event) {
    $scope.page = {};
    $scope.pageShown = true;
    $scope.pageSectionTitle = "tab_pages_addpage";
    $scope.pageEditType = "add";
    $scope.isReservedPage = false;
    $scope.page.content = '<div class="ui basic segment"> <div class="ui page grid"> <div class="column"> <h1>Lorem ipsum dolor sit amet, consectetur adipiscing elit</h1> <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam luctus neque sed ultrices imperdiet. Fusce egestas, dolor quis maximus condimentum, quam tellus porta nibh, a faucibus quam ligula facilisis neque. Maecenas pellentesque ex leo, vel laoreet dui pulvinar in. Donec nunc nisl, lacinia in pellentesque et, cursus a risus. Nullam at elit odio. Etiam venenatis id nisl non consectetur.</p> <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam luctus neque sed ultrices imperdiet. Fusce egestas, dolor quis maximus condimentum, quam tellus porta nibh, a faucibus quam ligula facilisis neque. Maecenas pellentesque ex leo, vel laoreet dui pulvinar in. Donec nunc nisl, lacinia in pellentesque et, cursus a risus. Nullam at elit odio. Etiam venenatis id nisl non consectetur.</p> </div> </div> </div>';
  }

  $scope.confirmPageAdd = function ($event) {
    //$scope.clearMessage();
    $scope.formData = {};
    $event.preventDefault();
    // $('#page-view-form').form('validate form');
    angular.copy($scope.page, $scope.formData);
    if ($scope.formData.hasOwnProperty("content")) {
      $scope.formData.content.replace(/&#10;/g, '');
      $scope.formData.content.replace(/&#9;/g, ' ');
      $scope.formData.content.replace(/&#8;/g, ' ');
    }

    if ($scope.formData.name) {
      msg = {
        'loading': true,
        'loading_message': 'in_progress'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();

      $scope.isCodeValid = !isDocumentWrite($scope.formData.content);

      if ($scope.isCodeValid) {
        Restangular.one('portal').one('page').customPOST($scope.formData).then(
          function (success) {
            $scope.pages.push(success[0]);

            $scope.pageShown = false;
            msg = {
              'header': "success_message_save_changes_button",
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
          },
          function (failure) {
            msg = {
              'header': failure.data.message,
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
          }
        );
      }
    } else {
      msg = {
        'header': 'tab_pages_editpage_pagename_validation'
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }
  }

  $scope.deleteOnePage = function ($event, page) {
    $scope.page = page;
    $('.delete-one-page-modal').modal('show');
  }

  $scope.publishPage = function () {
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    //$scope.clearMessage();
    $scope.pagesToPublish = [];

    var $table = $('.admin-table');
    $table.find('tbody > tr').each(function () {
      if ($(this).find('.t-check-box input').prop('checked')) {
        $scope.pagesToPublish.push($(this).scope().page);
        var page = $(this).scope().page;
        page.published = true;
        var path = page.path;
        delete page['path'];
        Restangular.one('portal/page', page.id.toString()).customPUT(page).then(
          function (success) {
            $rootScope.floatingMessage = [];
            msg = {
              'header': 'tab_pages_published_success'
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
            page.published = true;
          },
          function (failure) {
            msg = {
              'header': failure.data.message,
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
            page.published = false;
          }
        );
        $timeout(function () {
          page['path'] = path;
        });
      }
    });
    // ($scope.pagesToPublish.length);
    if ($scope.pagesToPublish.length == 0) {
      msg = {
        'header': 'tab_pages_select_error'
      }

      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }
  }

  $scope.unpublishPage = function () {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    $scope.pagesToPublish = [];
    var $table = $('.admin-table');
    $table.find('tbody > tr').each(function () {
      if ($(this).find('.t-check-box input').prop('checked')) {
        $scope.pagesToPublish.push($(this).scope().page);
        var page = $(this).scope().page;
        page.published = 'f';
        var path = page.path;
        delete page['path'];
        Restangular.one('portal/page', page.id.toString()).customPUT(page).then(function (success) {
          $rootScope.floatingMessage = [];
          msg = {
            'header': 'tab_pages_unpublished_success'
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          page.published = false;
        }, function (failure) {
          msg = {
            'header': failure.data.message,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
          page.published = true;
        });
        $timeout(function () {
          page['path'] = path;
        });
      }
    });
    if ($scope.pagesToPublish) {
      msg = {
        'header': 'tab_pages_select_error'
      }

      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }
  }

  $scope.confirmPageDelete = function ($event) {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    $event.preventDefault();
    $id = $scope.page.id;
    $form = {
      'page_id': $id,
    }
    Restangular.one('portal').one('page').all($id.toString()).customDELETE($form).then(
      function (success) {
        $.each($scope.pages, function (key, value) {
          if (value && value['id'] == success[0]['id']) {
            $scope.pages.splice(key, 1);
          }
        });
        $translate(['Page', 'deleted']).then(function (value) {
          $scope.p = value.Page;
          $scope.deleted = value.deleted;
          msg = {
            'header': $scope.p + " " + success[0].name + " " + $scope.deleted,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      },
      function (failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }
    );
  }

  $scope.deleteMultiPage = function ($event) {
    $scope.pagesToDelete = [];

    var $table = $('.admin-table');
    $table.find('tbody > tr').each(function () {
      if ($(this).find('.t-check-box input').prop('checked')) {
        $scope.pagesToDelete.push($(this).scope().page);
      }
    });
    if ($scope.pagesToDelete.length) {
      $('.delete-multi-page-modal').modal('show');
    } else {
      msg = {
        'header': 'tab_pages_select_error'
      }

      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }
  }

  $scope.confirmMultiPageDelete = function ($event) {
    // $scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    for (var i = 0; i < $scope.pagesToDelete.length; i++) {
      $id = $scope.pagesToDelete[i].id;
      $form = {
        'page_id': $id,
      }
      Restangular.one('portal').one('page').one($id.toString()).customDELETE($form).then(
        function (success) {
          $.each($scope.pages, function (key, value) {
            if (value && value['id'] == success[0]['id']) {
              $scope.pages.splice(key, 1);
            }
          });
          msg = {
            'header': "action_success"
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        },
        function (failure) {
          msg = {
            'header': failure.data.message,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        }
      );
    }

    $timeout(function () {
      if ($rootScope.floatingMessage.length == 0) {
        msg = {
          'header': 'tab_pages_delete_message',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }
    }, 500);
  }

  $scope.savePageOrder = function () {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    $('.page-item').each(function () {
      $(this).scope().page.display_priority = $(this).index() + 1;
    });
    for (var i = 0; i < $scope.pages.length; i++) {
      var page = {};
      angular.copy($scope.pages[i], page);
      delete page['path'];
      Restangular.one('portal').one('page').one(page.id.toString()).customPUT(page).then(
        function (success) {

        },
        function (failure) {
          msg = {
            'header': failure.data.message,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        }
      );
    }
    $timeout(function () {
      if ($rootScope.floatingMessage.length == 0) {
        msg = {
          'header': 'tab_pages_page_order_save',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }
    }, 500);
  }

  $scope.addMeta = function () {
    var customMeta = {
      "type": "",
      "name": "",
      "content": ""
    }
    if ($scope.page.meta == null) {
      $scope.page.meta = [];
    }
    $scope.page.meta.push(customMeta);
  }

  $scope.removeMeta = function (index) {
    // Remove this meta tag
    $scope.page.meta.splice(index, 1);
  }

  /*
    Verify if meta tags are duplicated in meta type and meta type value
    If there is duplicated, return false to stop saving procedure
    If there isn't, return true to continue saving
  */
  function verifyMetaTags() {
    // Meta array
    for (var i = 0; i < $scope.metaTypes.length; i++) {
      var metas = filterMetaTags($scope.metaTypes[i]);
      if (checkDuplicated(metas)) {
        return false;
      }
    }
    return true;
  }

  // Filter out the meta tags to have only the input meta type
  function filterMetaTags(metaType) {
    var filteredMeta = [];
    for (var i = 0; i < $scope.page.meta.length; i++) {
      // Check meta type against the input type
      if ($scope.page.meta[i].type == metaType) {
        filteredMeta.push($scope.page.meta[i]);
      }
    }
    return filteredMeta;
  }

  // Check duplicated meta type value within same meta type
  function checkDuplicated(metas) {
    for (var i = 0; i < metas.length; i++) {
      for (var j = 0; j < metas.length; j++) {
        // Check if there are names are the same
        if (i != j && metas[i].name == metas[j].name) {
          return true;
        }
      }
    }
    return false;
  }

  function getRandomColor() {
    var color = '';
    while (!color.match(/(#[c-e].)([e-f][a-f])([9-c].)/)) {
      color = '#' + Math.floor(Math.random() * (Math.pow(16, 6))).toString(16);
    }
    return color;
  }

  $scope.stripWords = function(path) {
    path = path.replace(/^\/+/g, '');
    path = path.replace(/^https?:\/\//,'')
    angular.element('#page-path').val(path);
  }

});
