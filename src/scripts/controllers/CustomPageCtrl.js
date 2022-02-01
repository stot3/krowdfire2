app.controller('CustomPageCtrl', function($route, $scope, Restangular, $routeParams, $location, $timeout, $anchorScroll, $rootScope, anchorSmoothScroll, UserService, RequestCacheService, $translate) {
  //Show the user information of the campaign page
  var paras = $location.$$path.split('/');
  $scope.path = paras[1];
  paras.shift();
  $scope.page_content = "";
  $scope.page_id = "";
  $scope.pages = [];
  $scope.successMessage = [];
  $scope.errorMessage = [];
  $scope.content_loading = true;
  $scope.page;
  $scope.is404 = 0;
  $scope.pageContent = true;
  $scope.campaignContent = false;
  $scope.urlPath = $location.path();
  //Removes last slash because Wordpress adds one that causes errors
  $scope.urlPath = $scope.urlPath.replace(/\/$/, "").slice(1);
  var $msg;
  Restangular.one('portal/setting').getList().then(
    function(success) {

      // seperate settings into two categories
      $scope.public_settings = {};
      $scope.private_settings = {};

      // loop and categorize the response data. put them into object
      angular.forEach(success, function(value) {
        if (value.setting_type_id == 3) {
          $scope.public_settings[value.name] = value.value;
        }
      });

      if ($scope.public_settings.site_case_insensitive_campaign_path) {
        Restangular.one('campaign').customGET(null, {
          use_path_lookup: 1,
          path_lookup_case_insensitive: true,
          path: $scope.urlPath
        }).then(function(success) {

          // Emit event for hiding loader.
          // $scope.$emit("loading_finished");
          $rootScope.campaignId = success.entry_id;
          $scope.pageContent = false;

          $scope.campaignContent = true;
        }, function(failed) {
          $scope.$on('$routeUpdate', function() {
            $route.reload();
          });
          RequestCacheService.getPage().then(function(success) {

            // Emit event for hiding loader.
            $scope.$emit("loading_finished");

            $scope.pages = success;
            $scope.pageContent = true;
            $scope.content_loading = false;
            for (var i = 0; i < $scope.pages.length; i++) {
              var stripped_path = "/" + $location.$$path.replace(/\/$/, "").slice(1);
              var regex = $scope.pages[i].path.replace(/\*/g, '[a-z0-9/-]*');
              if (stripped_path.match('^/' + regex + '$')) {
                $scope.page_id = $scope.path;
                $scope.page = $scope.pages[i];
                $scope.page_content = $scope.page.content;
                break;
              }
            }

            var pages = success;
            for (var i = 0; i < pages.length; i++) {
              if (pages[i].path) {
                var stripped_path = "/" + $location.$$path.replace(/\/$/, "").slice(1);
                var regex = pages[i].path.replace(/\*/g, '[a-z0-9/-]*');
                if (stripped_path.match('^/' + regex + '$')) {
                  $scope.is404 = 0;
                  break;
                } else {
                  $scope.is404 = 1;
                }
              }
            }

            //handle semantic ui js
            $timeout(function() {
              //FAQ Vertical Menu
              $('.ui.sticky').sticky({
                context: '#faq-wrap'
              });
              $('.ui.accordion').accordion();

              $('.ui.dropdown')
                .dropdown({
                  on: 'hover'
                });

              $('.demo.menu .item').tab({
                history: false
              });

              $('.tabular.menu .item').tab();

              $('a').click(function(e) {
                if ($(this).attr('href') && $(this).attr('href')[0] == '#') {
                  e.preventDefault();
                  var url = $(this).attr('href').slice(1);
                  $location.hash(url);
                  anchorSmoothScroll.scrollTo(url);
                }
              });

            }, 200);
          });
        });
      } else {
        Restangular.one('campaign').customGET(null, {
          use_path_lookup: 1,
          path: $scope.urlPath
        }).then(function(success) {
          $rootScope.campaignId = success.entry_id;
          $scope.pageContent = false;
          $scope.campaignContent = true;
        }, function(failed) {
          $scope.$on('$routeUpdate', function() {
            $route.reload();
          });
          RequestCacheService.getPage().then(function(success) {

            // Emit event for hiding loader.
            $scope.$emit("loading_finished");

            $scope.pages = success;
            $scope.pageContent = true;
            $scope.content_loading = false;
            for (var i = 0; i < $scope.pages.length; i++) {
              if ($scope.pages[i].path) {
                //Strips the ending / to work with wordpress
                var stripped_path = "/" + $location.$$path.replace(/\/$/, "").slice(1);
                var regex = $scope.pages[i].path.replace(/\*/g, '[a-z0-9/-]*');
                if (stripped_path.match('^/' + regex + '$')) {
                  $scope.page_id = $scope.path;
                  $scope.page = $scope.pages[i];
                  $scope.page_content = $scope.page.content;
                  break;
                }
                // if path is a blog post page
                else if ($location.$$path.indexOf("blog/post") !== -1 && $scope.pages[i].path.indexOf("blog/post") !== -1) {
                  $scope.page_id = $scope.path;
                  $scope.page = $scope.pages[i];
                  $scope.page_content = $scope.page.content;
                  break;
                }
              }
            }

            var pages = success;
            for (var i = 0; i < pages.length; i++) {
              if (pages[i].path) {
                var stripped_path = "/" + $location.$$path.replace(/\/$/, "").slice(1);
                var regex = pages[i].path.replace(/\*/g, '[a-z0-9/-]*');
                if (stripped_path.match('^/' + regex + '$')) {
                  $scope.is404 = 0;
                  break;
                } else {
                  if ($location.$$path.indexOf("blog/post") !== -1) {
                    $scope.is404 = 0;
                  } else {
                    $scope.is404 = 1;
                  }
                }
              }
            }

            //handle semantic ui js
            $timeout(function() {
              //FAQ Vertical Menu
              $('.ui.sticky').sticky({
                context: '#faq-wrap'
              });
              $('.ui.accordion').accordion();

              $('.ui.dropdown')
                .dropdown({
                  on: 'hover'
                });

              $('.demo.menu .item').tab({
                history: false
              });

              $('.tabular.menu .item').tab();

              $('a').click(function(e) {
                if ($(this).attr('href') && $(this).attr('href')[0] == '#') {
                  e.preventDefault();
                  var url = $(this).attr('href').slice(1);
                  $location.hash(url);
                  anchorSmoothScroll.scrollTo(url);
                }

              });

            }, 200);
          });
        });
      }
    });

  //Send message to the admin user
  $timeout(function() {
    // This is for backup for those that don't have this attribute value
    if ($("#contact")) {
      $("#contact .field-message textarea").attr("name", "description");
    }
    $translate(["contact_email_validate_error", "contact_name_validate_error", "contact_description_validate_error"]).then(function(translation) {
      $('.contact-form').form({
        email: {
          identifier: 'email',
          rules: [{
            type: 'email',
            prompt: translation.contact_email_validate_error,
          }]
        },
        name: {
          identifier: "name",
          rules: [{
            type: "empty",
            prompt: translation.contact_name_validate_error
          }]
        },
        description: {
          identifier: "description",
          rules: [{
            type: "empty",
            prompt: translation.contact_description_validate_error
          }]
        }
      }, {
        inline: true,
      });
      $('.contact-form .button').click(function() {
        $scope.successMessage = [];
        $scope.errorMessage = [];
        $form = {};
        $form['name'] = $('.field-name input').val();
        $form['email'] = $('.field-email input').val();
        $form['business_organization'] = $('.field-business input').val();
        $form['phone'] = $('.field-phone input').val();
        $form['description'] = $('.field-message textarea').val();

        Restangular.one('portal/contact').customPOST($form).then(
          function(success) {
            $msg = {
              'header': 'Message has been sent successfully'
            }
            $scope.successMessage.push($msg);
            $('.ui.dimmer.contact-success-dimmer').dimmer('show');
            $timeout(function() {
              $('.field-name input').val("");
              $('.field-email input').val("");
              $('.field-business input').val("");
              $('.contact-form .field:nth-child(4) input').val("");
              $('.field-phone input').val("");
              $('.field-message textarea').val("");
              $('.ui.dimmer.contact-success-dimmer').dimmer('hide');
            }, 2000);
          },
          function(failure) {
            $msg = {
              'header': "Error",
            }
            $lst = [];
            $.each(failure.data.errors, function(key, value) {
              $lst.push(value[0].message);
            });
            $msg['item'] = $lst;
            $scope.errorMessage.push($msg);
          }
        );
      });
    });
  }, 2000);
});