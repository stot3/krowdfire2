//------------------------------------------------------
//    CATEGORY MANAGEMENT / CATEGORY CONTROLLER
//------------------------------------------------------
app.controller('AdminCategoriesCtrl', function($q, $scope, $rootScope, $timeout, $translatePartialLoader, $translate, Restangular, RequestCacheService) {

  $scope.clearMessage = function() {
    $rootScope.floatingMessage = [];
  }

  var msg = [];

  function getCategoryList() {
    Restangular.one("portal/category").get().then(function(success) {
      $scope.subcategories = {};
      $scope.categories = success;
      angular.forEach($scope.categories, function(value, key) {
        if(value.parent_category_id){
          if(!$scope.subcategories[value.parent_category_id]){
            $scope.subcategories[value.parent_category_id] = [];
          }
          $scope.subcategories[value.parent_category_id].push(value);
          $scope.subcategories[value.parent_category_id] = $scope.subcategories[value.parent_category_id].sort(function(a, b) {
            return a.display_priority > b.display_priority;
          });
        }
      });
    });
  }

  getCategoryList();

  //add category button clicked
  $scope.addCategory = function() {
    $scope.formData = {};
    $('.add-category-modal').modal('show');
    // $('.ui.form#add-category, .ui.form#edit-category').form('clear');
  }

  $scope.setParentCategory = function(category) {
    $scope.formData.parent_category = category.id;
    $scope.formData.display_priority = category.display_priority+.1;
  }

  var formValidation = function() {
    var translation = $translate.instant(["tab_categories_category_cname_message"]);
    $('.ui.form#add-category, .ui.form#edit-category').form({
      category_name: {
        identifier: 'category_name',
        rules: [{
          type: 'empty',
          prompt: translation.tab_categories_category_cname_message
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
    $('.ui.form#add-category, .ui.form#edit-category').form('validate form');
  }

  //add modal add button clicked
  $scope.confirmAdd = function($event) {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    $target = $($event.currentTarget);
    $event.preventDefault();

    formValidation();
    if ($scope.formValCheck) {
      categoryAttributes = {};
      categoryAttributes['ogtype'] = $scope.formData.ogtype;
      categoryAttributes['ogtitle'] = $scope.formData.ogtitle;
      categoryAttributes['ogdescription'] = $scope.formData.ogdescription;
      categoryAttributes['ogimage'] = $scope.formData.ogimage;

      var formData = {
          "name": $scope.formData.category_name,
          "description": $scope.formData.description,
          "uri_path": $scope.formData.uri_path,
          "attributes": JSON.stringify(categoryAttributes)
      };
        
      // if sub category is set
      if($scope.formData.parent_category){
        if($scope.subcategories[$scope.formData.parent_category]){
          var subcat_length = $scope.subcategories[$scope.formData.parent_category].length;
        }else{
          var subcat_length = 0;
        }
        formData.parent_category_id = $scope.formData.parent_category;
        var parent_category = _.findKey($scope.categories, {'id': $scope.formData.parent_category});
        formData.display_priority	= $scope.categories[parent_category].display_priority + (.1*(subcat_length + 1));
      }

      Restangular.one('portal').all('category').customPOST(formData).then(
        function(success) {
          $scope.category = success;
          $scope.categories.push(success);

          $translate(['Category', 'added']).then(function(value) {
            $scope.cat = value.Category;
            $scope.added = value.added;
            msg = {
              'header': $scope.cat + " " + $scope.formData.category_name + " " + $scope.added,
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
            getCategoryList();  
          });
        },
        function(failure) {
          $rootScope.floatingMessage = [];
          msg = {
            'header': failure.data.message
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      $target.closest('.modal').modal({
        onHidden: function() {
          $('.ui.form#add-category, .ui.form#edit-category').form('clear');
        }
      }).modal('hide');

    } else {
      $rootScope.floatingMessage = [];
    }
  }

  $scope.formData = {};
  //edit icon clicked
  $scope.editCategory = function($event, category) {
    $scope.formData = {};
    $scope.formData.category_name = category.name;
    $scope.formData.description = category.description;
    $scope.formData.id = category.id;
    $scope.formData.parent_category = category.parent_category_id;
    if(category.uri_paths){
      $scope.formData.uri_path = category.uri_paths[0].path;
    }

    //Load og attributes
    if(category.attributes){
      $scope.formData.ogtype = category.attributes["ogtype"];
      $scope.formData.ogtitle = category.attributes["ogtitle"];
      $scope.formData.ogdescription = category.attributes["ogdescription"];
      $scope.formData.ogimage = category.attributes["ogimage"];

      $('[name="formDatacategory_ogtype"]').val($scope.formData.ogtype);
      $('[name="formDatacategory_ogtitle"]').val($scope.formData.ogtitle);
      $('[name="formDatacategory_ogdescription"]').val($scope.formData.ogdescription);
      $('[name="formDatacategory_ogimage"]').val($scope.formData.ogimage);
    }
    $('[name="category_name"]').val($scope.formData.category_name);
    $('[name="category_description"]').val($scope.formData.description);
    if(category.uri_paths) {
      $('[name="formDatacategory_url"]').val($scope.formData.uri_path);
    }

    //$('.dropdown').dropdown({'set selected': category.parent_category_id});
    $('.edit-category-modal').modal('show');
    // $('.ui.form#add-category, .ui.form#edit-category').form('clear');
  }

  //edit category modal apply button clicked
  $scope.confirmEdit = function($event) {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    $target = $($event.currentTarget);
    $event.preventDefault();

    formValidation();
    if ($scope.formValCheck) {

      categoryAttributes = {};
      categoryAttributes['ogtype'] = $scope.formData.ogtype;
      categoryAttributes['ogtitle'] = $scope.formData.ogtitle;
      categoryAttributes['ogdescription'] = $scope.formData.ogdescription;
      categoryAttributes['ogimage'] = $scope.formData.ogimage;


      var form = {
        "category_id": $scope.formData.id,
        "name": $scope.formData.category_name,
        "description": $scope.formData.description,
        "parent_category_id": $scope.formData.parent_category,
        "uri_path": $scope.formData.uri_path,
        "attributes": JSON.stringify(categoryAttributes)
      };
      Restangular.one('portal').one('category').all($scope.formData.id.toString()).customPUT(form).then(
        function(success) {
          getCategoryList();
          $scope.category = success;
          $scope.formData.error = "";
          $.each($scope.categories, function(key, value) {
            if (value['id'] == success['id']) {
              value['name'] = success['name'];
              value['description'] = success['description'];
            }
          });

          $translate(['Category', 'modified']).then(function(value) {
            $scope.cat = value.Category;
            $scope.modified = value.modified;
            msg = {
              'header': $scope.cat + " " + success.name + " " + $scope.modified,

            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();

          });
        },
        function(failure) {
          $rootScope.floatingMessage = [];
          msg = {
            'header': failure.data.message
          };
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      $target.closest('.modal').modal('hide');
    }
  }

  //delete categories button clicked
  $scope.deleteMultiCategory = function() {
    //$scope.clearMessage();
    var msg = [];
    $scope.categoryToDelete = [];
    $('.category-sortable-item').each(function() {
      if ($(this).find('.t-check-box input').prop('checked')) {
        // if subcat is selected
        if($(this).find('.t-check-box input').attr("value")){
          var subcat = {
            id: $(this).find('.t-check-box input').attr("value"),
            name: $(this).find('.t-check-box input').attr("name")
          };
          $scope.categoryToDelete.push(subcat);
        }else{
          $scope.categoryToDelete.push($(this).scope().category);
        }
      }
    });

    if ($scope.categoryToDelete.length) {
      $('.delete-multi-category-modal').modal('setting', {
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

  function deleteCategoryByID(id) {
    return Restangular.one('portal/category', id).customDELETE();
  }

  //multiple categories delete modal yes button clicked
  $scope.confirmMultiDelete = function() {
    //$scope.clearMessage()
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;;
    var requestQueue = [];
    for (var i = 0; i < $scope.categoryToDelete.length; i++) {
      requestQueue.push(deleteCategoryByID($scope.categoryToDelete[i].id));
    }
    $q.all(requestQueue).then(function() {
      getCategoryList();
      msg = {
        'header': "tab_categories_delete_successful",
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }, function(failed) {
      msg = {
        'header': failed.data.message,
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  }

  //sortable list options
  $scope.categorySortOptions = {
    stop: function(e, ui) {
      for (var i = 0; i < $scope.categories.length; i++) {
        $scope.categories[i].display_priority = i + 1;
      }
      $scope.saveCategoryOrder();
    }
  }

  $scope.subCategorySortOptions = {
    stop: function(e, ui) {
      var requestQueue = [];
      for (var i = 0; i < $scope.categories.length; i++) {
        if($scope.subcategories[$scope.categories[i].category_id]){
          angular.forEach($scope.subcategories[$scope.categories[i].category_id], function(value, key){
            value.display_priority = $scope.categories[i].display_priority +"."+(key+1);
            requestQueue.push(Restangular.one('portal/category', value.id.toString()).customPUT(value));
          });
        }
        $q.all(requestQueue).then(
          function(success) {
            msg = {
              'header': 'tab_categories_save_successful',
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
          },
          function(failure) {
            msg = {
              'header': failure.data.message,
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
          }
        );
      }
    }
  }

  $scope.saveCategoryOrder = function() {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    $scope.successShown = false;
    $scope.errorShown = false;
    $scope.hideFloatingMessage();
    $scope.formData.error = "";
    var requestQueue = [];
    for (var i = 0; i < $scope.categories.length; i++) {
      var obj = $scope.categories[i];
      requestQueue.push(Restangular.one('portal/category', obj.id.toString()).customPUT(obj));
    }
    $q.all(requestQueue).then(
      function(success) {
        msg = {
          'header': 'tab_categories_save_successful',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      },
      function(failure) {
        msg = {
          'header': failure.data.message,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }
    );
  }

  // check all boxes
  $scope.checkAllCategories = function ($evt, wrapper_class) {
    //$($evt).children().find('.ui.checkbox').checkbox('check');
    var input = $(".categoriescheckall").is(':checked');
    if (input) {
      $(wrapper_class).find('.ui.checkbox').checkbox('uncheck');
    } else {
      $(wrapper_class).find('.ui.checkbox').checkbox('check');
    }
  }
});
