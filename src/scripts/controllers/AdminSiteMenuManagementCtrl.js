//------------------------------------------------------
//    SITE MENU MANAGEMENT / SITE MENU CONTROLLER
//------------------------------------------------------
app.controller('AdminSiteMenusCtrl', function ($location, $q, $scope, $rootScope, $timeout, $translatePartialLoader, $translate, Restangular, RequestCacheService) {
    var msg = [];

    $scope.menuSections = ['Navigation', 'Footer 1', 'Footer 2'];
    $scope.menu_links = [];
    $scope.publishedFields = true;
    $scope.parentPage = null;
    $scope.publishedPage = null;
    $scope.externalLink = {
        "name": "",
        "path": ""
    };

    $scope.menuSortOptions = {
        stop: function (e, ui) {
            saveMenu();
        }
    }
    $scope.changeFieldsDisplay = function () {
        $scope.publishedFields = !$scope.publishedFields;
    }
    function initTableItems() {
        $scope.menu_selected = "Navigation";
        $scope.menu_links = $scope.public_settings.site_menu_header;
    }
    function getPublicSettings() {
        Restangular.one('portal/setting').getList().then(
            function (success) {
                // seperate settings into two categories
                $scope.public_settings = {};
                $scope.private_settings = {};
                // loop and categorize the response data. put them into object
                angular.forEach(success, function (value) {
                    if (value.setting_type_id == 3) {
                        $scope.public_settings[value.name] = value.value;

                    } else if (value.setting_type_id == 1) {
                        $scope.private_settings[value.name] = value.value;
                    }
                });
                initTableItems();
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
    getPublicSettings();

    $scope.menuManage = function (menu) {
        $scope.menuShow = true;
        $scope.menu_selected = menu;
        var footer = $scope.public_settings.site_menu_footer;
        if (menu == 'Navigation') {
            $scope.menu_links = $scope.public_settings.site_menu_header;
        } else if (menu == 'Footer 1') {
            $scope.menu_links = footer.hasOwnProperty('left') ? footer.left : []
        } else if (menu == "Footer 2") {
            $scope.menu_links = footer.hasOwnProperty('right') ? footer.right : [];
        }
    }
    $scope.findPageByID = function (id) {
        for (var i = 0; i < $scope.pages.length; i++) {
            if ($scope.pages[i].id == id) {
                return $scope.pages[i];

            }
        }
        return {};
    }


    // Site Menu Actions
    $scope.setExternalLink = function () {
        if ($scope.externalLink.name != "" && $scope.externalLink.path != "") {
            $scope.menu_links.push($scope.externalLink);
            $scope.externalLink = {
                "name": "",
                "path": ""
            };
        }
    }

    $scope.setParentPage = function (page) {
        $scope.parentPage = page;
    }
    $scope.setPublishedPage = function (page) {
        $scope.publishedPage = page;
    }
    $scope.addToParent = function (page) {
        // search menu_links for parent id, then push page to
        for (var i = 0; i < $scope.menu_links.length; i++) {
            if ($scope.parentPage.id == $scope.menu_links[i].id) {
                var formattedPage = {
                    id: page.id,
                    name: page.name,
                    path: page.path
                };
                // check for existing subpages key
                if ($scope.menu_links[i].hasOwnProperty('subpages')) {
                    $scope.menu_links[i].subpages.push(formattedPage);
                } else {
                    $scope.menu_links[i].subpages = [formattedPage];
                }
                break;
            }
        }
    }
    $scope.clickPages = function() {
        $timeout(function(){
            angular.element('[data-tab="pages"]').triggerHandler('click');
         });
    }
    $scope.addPage = function ($event) {
        // If toggled on external fields
        $target = $($event.currentTarget);
        $event.preventDefault();
        if (!$scope.publishedFields) {
            if ($scope.externalLink.name != "" && $scope.externalLink.path != "") {
                // if parent, push under parent, else push to menu_links
                if ($scope.parentPage !== null) {
                    $scope.addToParent($scope.externalLink);
                    $scope.parentPage = null;
                } else {
                    $scope.menu_links.push($scope.externalLink);
                }
                $scope.externalLink = {
                    "name": "",
                    "path": ""
                };
            }
        } else {
            if ($scope.parentPage !== null) {
                $scope.addToParent($scope.publishedPage);
                $scope.parentPage = null;
            } else {
                var count = 0;
                if($scope.publishedPage !== null) {

                    for (var i = 0; i < $scope.menu_links.length; i++) {
                            if ($scope.publishedPage.id == $scope.menu_links[i].id) {
                                count++;
                                break;
                            }
                        
                    }

                    if (count == 0) {
                        var insert = true;

                        //TODO: update the menus when add, remove or reorder the links
                        if ($scope.menu_selected == 'Navigation') {
                            if ($scope.menu_links.length >= 7) {
                                $translate(['too_many_links']).then(function (value) {
                                    $scope.$parent.formData.error = value.too_many_links;
                                });
                                $('.response-error-modal').modal('show');
                                insert = false;
                            }
                        }

                        if (insert) {
                            $scope.menu_links.push($scope.publishedPage);
                        }
                    }
                }
            }
        }
        formValidation();
        if($scope.formValCheck) {
            saveMenu();
            $target.closest('.modal').modal({
                onHidden: function () {
                    $('.ui.form#add-menu-item').form('clear');
                }
            }).modal('hide');
        }
        
    }

    function formValidation() {
        var translation = $translate.instant(["tab_sitemenu_missing_name_error", "tab_sitemenu_mising_path_error", "tab_sitemenu_select_page_error"]);
        if($scope.publishedFields){
            $('.ui.form#add-menu-item').form({
                published_select: {
                  identifier: 'published-select',
                  rules: [{
                    type: 'empty',
                    prompt: translation.tab_sitemenu_select_page_error
                  }]
                }
              }, {
                inline: true,
                keyboardShortcuts: false,
                onSuccess: function() {
                  $scope.formValCheck = true;
                },
                onFailure: function() {
                  $scope.formValCheck = false;
                }
          
              });
        } else {
            $('.ui.form#add-menu-item').form({
                link_name: {
                  identifier: 'link_name',
                  rules: [{
                    type: 'empty',
                    prompt: translation.tab_sitemenu_missing_name_error
                  }]
                },
                link_path: {
                  identifier: 'link_path',
                  rules: [{
                    type: 'empty',
                    prompt: translation.tab_sitemenu_missing_path_error
                  }]
                }
              }, {
                inline: true,
                keyboardShortcuts: false,
                onSuccess: function() {
                  $scope.formValCheck = true;
                },
                onFailure: function() {
                  $scope.formValCheck = false;
                }
          
              });
        }

        $('.ui.form#add-menu-item').form('validate form');
      }
    function saveMenu() {
        var payload = $scope.public_settings;
        if ($scope.menu_selected == 'Navigation') {
            payload.site_menu_header = $scope.menu_links;
        } else if ($scope.menu_selected == 'Footer 1') {
            payload.site_menu_footer.left = $scope.menu_links;
        } else if ($scope.menu_selected == 'Footer 2') {
            payload.site_menu_footer.right = $scope.menu_links;
        }
        //             $scope.menu_links = footer.hasOwnProperty('right') ? footer.right : [];

        console.log(payload);
        var request = Restangular.one('portal/setting/public').customPUT(payload);
        request.then(function () {
            msg = {
                'header': "success_message_save_changes_button",
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
        }, function (failed) {
            msg = {
                'header': failed.data.message,
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
        });
    }

    $scope.deleteLink = function (link) {
        for (var i = 0; i < $scope.menu_links.length; i++) {
            if (link.id != undefined && $scope.menu_links[i].id == link.id) {
                $scope.menu_links.splice(i, 1);
            } else if (link.name != undefined && $scope.menu_links[i].name == link.name) {
                $scope.menu_links.splice(i, 1);
            }
        }
        // saveMenu();
    }
    $scope.deleteSubLink = function (parent, link) {
        for (var i = 0; i < parent.subpages.length; i++) {
            if (link.id != undefined && parent.subpages[i].id == link.id) {
                parent.subpages.splice(i, 1);
            } else if (link.name != undefined && parent.subpages[i].name == link.name) {
                parent.subpages.splice(i, 1);
            }
        }
        // saveMenu(); 
    }
    $scope.deleteSubSave = function(parent, link){
        $scope.deleteSubLink(parent, link);
        saveMenu();
    }
    $scope.deleteLinkSave = function(link){
        $scope.deleteLink(link);
        saveMenu();
    }
    $scope.deleteMultiMenuItems = function () {
        //$scope.clearMessage();
        var msg = [];
        $scope.menuItemsToDelete = [];
        $scope.subMenuItemsToDelete = [];

        $('.category-sortable-item').each(function () {
            if ($(this).find('.t-menu-check-box input').prop('checked')) {
                // if submenu is selected
                if($(this).scope().hasOwnProperty('link')) {
                    $scope.menuItemsToDelete.push($(this).scope().link);
                } else {
                    var subMenuItem = {
                        parent: $(this).offsetParent().scope().link,
                        subpage: $(this).scope().subpage
                    };
                    $scope.subMenuItemsToDelete.push(subMenuItem);
                }
            }
        });

        if ($scope.menuItemsToDelete.length || $scope.subMenuItemsToDelete.length) {
            $('.delete-multi-items-modal').modal('setting', {
                onApprove: $scope.confirmMultiDelete,
            }).modal('show');
        } else {
            msg = {
                'header': "tab_categories_select_error",
            }

            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
        }
    }

    $scope.confirmMultiDelete = function() {
        //$scope.clearMessage()
        msg = {
          'loading': true,
          'loading_message': 'in_progress'
        }
        $rootScope.floatingMessage = msg;

        for(var i = 0; i < $scope.subMenuItemsToDelete.length; i++) {
            $scope.deleteSubLink($scope.subMenuItemsToDelete[i].parent, $scope.subMenuItemsToDelete[i].subpage);
        }

        for(var i = 0; i < $scope.menuItemsToDelete.length; i++) {
            $scope.deleteLink($scope.menuItemsToDelete[i]);
        }
        saveMenu();

      }

    $scope.editLink = function (link) {
        if (!link.edit) {
            link.edit = true;
        } else {
            link.edit = false;
            saveMenu();
        }
    }
    // ----------------MODAL-------------------------------------
    $scope.showAddPageModal = function () {
        $('.add-page-modal').modal('show');
    }
    //   -------------------------------------------
    $scope.clearMessage = function () {
        $rootScope.floatingMessage = [];
    }

});
