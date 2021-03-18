// Match directive, sets $error.match validity based on whether it matches a model
app.directive('match', function() {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      match: '='
    },
    link: function(scope, elem, attrs, ctrl) {
      scope.$watch('match', function(pass) {
        ctrl.$validate();
      });
      ctrl.$validators.match = function(modelValue) {
        return (ctrl.$pristine && (angular.isUndefined(modelValue) || modelValue === "")) || modelValue === scope.match;
      };
    }
  };
});

// Validate Email field
app.directive('validateEmail', function() {
  var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
  return {
    link: function(scope, elm) {
      elm.on("keyup", function() {
        var isMatchRegex = EMAIL_REGEXP.test(elm.val());
        if (isMatchRegex && elm.hasClass('email-error') || elm.val() == '') {
          elm.removeClass('email-error');
        } else if (isMatchRegex == false && !elm.hasClass('email-error')) {
          elm.addClass('email-error');
        }
      });
    }
  }
});

// Dropdown directive for SemanticUI dropdowns
app.directive('dropdown', function($timeout) {
  return {
    restrict: "C",
    require: "?ngModel",
    link: function(scope, elm, attr, modelCtrl) {
      if (elm.hasClass('ui')) {
        // if ngModel is used
        // set dropdown value as the same as ngModel
        if (modelCtrl) {
          scope.$watch(function() {
            return modelCtrl.$modelValue;
          }, function(value) {
            if (value) {
              $timeout(function() {
                elm.dropdown('set selected', value);
              });
            }
          });
          // set ngModel onChange
          elm.dropdown({
            onChange: function(value, text) {
              modelCtrl.$setViewValue(value);
            }
          });
        }
        if (attr.defaultValue !== undefined) {
          if (scope.default_card !== undefined && scope.defaultindex !== undefined) {
            elm.dropdown('set text', ["<img src='images/cards/" + scope.default_card.stripe_account_card_type + ".png'/>**** **** **** <span>" + scope.default_card.last4 + "</span>"]).dropdown('set value', scope.default_card.last4);
            scope.cardSelected(scope.default_card, scope.defaultindex);
          } else {
            elm.dropdown();
          }
        } else {
          elm.dropdown();
        }
      }
    }
  };
});

//  directive for SemanticUI checkboxes
app.directive('checkbox', function($timeout) {
  return {
    restrict: "C",
    require: "?ngModel",
    link: function(scope, elm, attr, modelCtrl) {
      if (elm.hasClass('ui')) {
        // if elememt has class radio
        if (elm.hasClass('radio')) {
          if (modelCtrl) {
            var radio_value = elm.find('input').attr('value');

            scope.$watch(function() {
              return modelCtrl.$modelValue;
            }, function(value) {
              if (value) {
                if (value == radio_value) {
                  $timeout(function() {
                    elm.checkbox('check');
                  });
                }
              }
            });

            // update ngModel onChange
            elm.checkbox({
              onChange: function() {
                var temp = elm.checkbox('is checked') ? true : false;
                if (temp) {
                  modelCtrl.$setViewValue(radio_value);
                }
              }
            });
          } else {
            elm.checkbox();
          }
        } else {
          // if ngModel is used
          if (modelCtrl) {
            // set default value
            scope.$watch(function() {
              return modelCtrl.$modelValue;
            }, function(value) {
              if (value) {
                $timeout(function() {
                  elm.checkbox('check');

                });
              }
            });
            // update ngModel onChange
            elm.checkbox({
              onChange: function() {
                var temp = elm.checkbox('is checked') ? true : false;
                modelCtrl.$setViewValue(temp);
              }
            });
          } else {
            elm.checkbox();
          }

        }
      }
    }
  };
});

// Dropdown directive for SemanticUI progress bar
app.directive('progress', function($timeout) {
  return {
    restrict: "C",
    link: function(scope, elm, attr) {
      if (elm.hasClass('ui')) {
        scope.$watch(function() {
          return attr.percent;
        }, function(value) {
          if (!isNaN(value)) {
            elm.progress();
          }
        });

      }
    }
  };
});

// Dropdown directive for SemanticUI pop up
app.directive('suiPopup', function($timeout) {
  return {
    restrict: "A",
    link: function(scope, elm, attr) {
      elm.popup({
        context: 'body .pusher'
      });
    }
  };
});

//  directive for SemanticUI accordion
app.directive('ngAccord', function($timeout) {
  return {
    restrict: "A",
    link: function(scope, elm, attr) {
      if (elm.hasClass('sort-cat')) {
        elm.accordion({
          selector: {
            exclusive: false,
            trigger: '.title .dropdown.icon'
          }
        });
      } else {
        elm.accordion({
          exclusive: false,
        });
      }
    }
  };
});

app.directive('phoneNumberOnly', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, modelCtrl) {
      var regex = /[^0-9 ]+/g;

      modelCtrl.$parsers.push(function(inputValue) {
        if (inputValue == undefined) return '';
        var res = inputValue.match(regex);
        var transformedInput = inputValue.replace(res, '');
        // this next if is necessary for when using ng-required on your input.
        // In such cases, when a letter is typed first, this parser will be called
        // again, and the 2nd time, the value will be undefined
        if (transformedInput != inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }
        return transformedInput;
      });

    }
  }
});

// Limits the input field to only contain numbers. If anything else is input, it will be removed.
app.directive('numbersOnly', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, modelCtrl) {
      var regex = /[^0-9]/g;
      if (attrs.allowDecimal) {
        regex = /[^0-9]+(\.[0-9]{1,2})/g;

      }


      modelCtrl.$parsers.push(function(inputValue) {
        if (inputValue == undefined) return '';
        var res = inputValue.match(regex);
        var transformedInput = inputValue.replace(res, '');
        // this next if is necessary for when using ng-required on your input.
        // In such cases, when a letter is typed first, this parser will be called
        // again, and the 2nd time, the value will be undefined
        if (transformedInput != inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }
        return transformedInput;
      });

      // element.bind('blur', function() {
      // 	var match = modelCtrl.$modelValue.match(/\d+(\.\d+)?|\.\d+/g);
      // });
    }
  };
});

app.directive('numberWithDecimals', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, modelCtrl) {
      var regex = /[^0-9]/g;
      if (attrs.allowDecimal) {
        regex = /[0-9]+(\.[0-9]{1,2})/g;
      }


      modelCtrl.$parsers.push(function(inputValue) {
        if (inputValue == undefined) return '';
        var res = inputValue.match(regex);
        if (regex == /[^0-9]/g) {
          var transformedInput = inputValue.replace(res, '');
        } else {
          var object_size = 0;
          for (key in res) {
            if (res.hasOwnProperty(key)) {
              object_size++;
            }
          }

          if (object_size > 0) {
            var transformedInput = res[0];
          } else {
            var transformedInput = inputValue;
          }
        }


        // this next if is necessary for when using ng-required on your input.
        // In such cases, when a letter is typed first, this parser will be called
        // again, and the 2nd time, the value will be undefined
        if (transformedInput != inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }
        return transformedInput;
      });

      // element.bind('blur', function() {
      //  var match = modelCtrl.$modelValue.match(/\d+(\.\d+)?|\.\d+/g);
      // });
    }
  };
});
// Same as numbersOnly directive, but also limits the number to up to 365 only. If it's any more, set to 365
app.directive('365Only', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function(inputValue) {
        // this next if is necessary for when using ng-required on your input.
        // In such cases, when a letter is typed first, this parser will be called
        // again, and the 2nd time, the value will be undefined
        if (inputValue == undefined) return '';
        var transformedInput = (inputValue.replace(/[^0-9]/g, '') > 365) ? "365" : inputValue.replace(/[^0-9]/g, '');
        if (transformedInput != inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }
        return transformedInput;
      });
    }
  };
});

// Sends keystrokes to a designated endpoint
app.directive('keyboardPoster', function($parse, $timeout) {
  var DELAY_BEFORE_FIRING = 300;
  return function(scope, elem, attrs) {

    var element = angular.element(elem)[0];
    var currentTimeout = null;
    element.oninput = function() {
      var model = $parse(attrs.postFunction);
      var poster = model(scope);

      if (currentTimeout) {
        $timeout.cancel(currentTimeout)
      }
      currentTimeout = $timeout(function() {
        poster(angular.element(element).val());
      }, DELAY_BEFORE_FIRING)
    }
  }
});

// Cancels form submission if the form is not valid
app.directive('validateSubmit', ['$parse', function($parse) {
  return {
    restrict: 'A',
    require: 'form',
    link: function(scope, formElement, attributes, formController) {

      var fn = $parse(attributes.rcSubmit);

      formElement.bind('submit', function(event) {
        // if form is not valid cancel it.
        if (!formController.$valid) return false;

        scope.$apply(function() {
          fn(scope, {
            $event: event
          });
        });
      });
    }
  }
}]);

// On button click, check if the nearest form has any fields that are invalid, then scrolls and focuses the first of those fields
app.directive('accessibleForm', function() {
  return {
    scope: true,
    link: function(scope, element, attrs) {
      var form = scope[attrs.name];

      element.bind('click', function(event) {
        var field = null;
        for (field in form) {
          if (form[field].hasOwnProperty('$pristine') && form[field].$pristine) {
            form[field].$dirty = true;
          }
        }

        var invalid_elements = $('form, ng-form').find('.ng-invalid,.has-error');
        if (invalid_elements.length > 0) {
          // element.attr('disabled', true);
          $('html,body').animate({
            scrollTop: $(invalid_elements[0]).offset().top
          }, 500, function() {
            invalid_elements[0].focus();
          });
        }
      });
    }
  };
});

app.directive('myMaxlength', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelCtrl) {
      var maxlength = Number(attrs.myMaxlength);

      function fromUser(text) {
        if (text.length > maxlength) {
          var transformedInput = text.substring(0, maxlength);
          ngModelCtrl.$setViewValue(transformedInput);
          ngModelCtrl.$render();
          return transformedInput;
        }
        return text;
      }
      ngModelCtrl.$parsers.push(fromUser);
    }
  };
});

/**
 * AddThis widget directive
 *
 * Usage:
 *   1. include `addthis_widget.js` in header with async=1 parameter
 *   <script src="//s7.addthis.com/js/300/addthis_widget.js#pubid=<pubid>&async=1"></script>
 *   http://support.addthis.com/customer/portal/articles/381263-addthis-client-api#configuration-url
 *   2. add "addthis-toolbox" directive to a widget's toolbox div
 *   <div addthis-toolbox class="addthis_toolbox addthis_default_style addthis_32x32_style">
 *     ...       ^
 *   </div>
 */

app.directive('addthisToolbox', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    template: '<div ng-transclude></div>',
    link: function($scope, element, attrs) {
      $timeout(function() {
        // Dynamically init for performance reason
        // Safe for multiple calls, only first call will be processed (loaded css/images, popup injected)
        // http://support.addthis.com/customer/portal/articles/381263-addthis-client-api#configuration-url
        // http://support.addthis.com/customer/portal/articles/381221-optimizing-addthis-performance
        addthis.init();
        // Ajax load (bind events)
        // http://support.addthis.com/customer/portal/articles/381263-addthis-client-api#rendering-js-toolbox
        // http://support.addthis.com/customer/portal/questions/548551-help-on-call-back-using-ajax-i-lose-share-buttons
        addthis.toolbox($(element).get(), {}, {
          title: attrs.title
        });
      });
    }
  }
}]);

app.directive('dragDropList', function() {
  return function(scope, element, attrs) {
    var toUpdate;
    var startIndex = -1;

    scope.$watch(attrs.dragDropList, function(value) {
      toUpdate = value;
    }, true);

    $(element[0]).sortable({
      items: 'li',
      start: function(event, ui) {
        startIndex = ($(ui.item).index());
      },
      stop: function(event, ui) {
        var newIndex = ($(ui.item).index());
        var toMove = toUpdate[startIndex];
        toUpdate.splice(startIndex, 1);
        toUpdate.splice(newIndex, 0, toMove);

        scope.$apply(scope.model);
      },
      axis: 'y'
    })
  }
});

app.directive('loading', function($http) {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      scope.isLoading = function() {
        return $http.pendingRequests.length > 0;
      };

      scope.$watch(scope.isLoading, function(v) {
        if (v) {
          elm.show();
        } else {
          elm.hide();
        }
      });
    }
  };
});

app.directive('htmlRender', function($compile) {
  return {
    restrict: 'EA',
    scope: {
      html: '=html'
    },
    link: function(scope, element, attrs) {
      scope.$watch('html', function(value) {
        if (value) {
          //value = value.replace(/'/g , "&#39;");
          value = "<div>" + value + "</div>";

          //Search all string with iframe - search for src, see if its youtube, remove string
          if (element.hasClass('reward-desc')) {
            value = value.replace(/<\/?iframe[^>]*>/g, "");
          }

          var markup = $compile(value)(scope);
          element.empty();
          element.append(markup);
        }
      });
    }
  }
});
app.directive('webuiPgwslider', function($timeout) {
  return {
    scope: {
      options: '=options',
    },
    link: function(scope, element, attrs) {
      if (scope.listPosition == true) {}
      var options = {
        "displayList": false,
        "transitionEffect": 'sliding',
        'displayControls': false,
        'touchControls': true,
      }
      if (scope.options) {
        options = scope.options;
      }
      if (attrs && attrs.length > 0) {
        var lst = $.parseJSON(attrs.webuiPgwslider);
        $.each(lst, function(key, value) {
          options[key] = value;
        });
      }
      // var lst = $.parseJSON('{ "name": "John" }');
      $timeout(function() {
        var slider = $('.pgwSlider').pgwSlider(options);
        $(".fr-view:first").height(options["maxHeight"]);
      })

    }
  }
});

// app.directive('sticky', function() {
// 	return {
// 		restrict: "A",
// 		link: function(scope, element, attr) {
// 			$(element).sticky();
// 		}
// 	}
// });

app.directive('sticky', function($window, $compile, $timeout) {
  return function(scope, element, attrs) {
    // declare variables
    var stickyClass = scope.stickyClass || null,
      $elem = element,
      elem = $elem[0],
      offset = scope.offSet || 0,
      isSticking = false;
    // element top
    var elemTop = getElementTop(elem);

    // create element clone once the scope is fully loaded
    createClone($elem);

    // watcher
    scope.$watch(function() {
      // if is sticking, return original elemtop value(prevent changing)
      if (isSticking) return elemTop;
      // get element top value
      elemTop = getElementTop(elem);
      return elemTop;
    }, function(newVal, oldVal) {
      // if value changes
      if (newVal !== oldVal) {
        // re-assign value
        elemTop = newVal;

      }
    });

    // on window scroll function
    $(window).scroll(function() {
      // track window top
      var windowTop = $(window).scrollTop();
      // check if should stick
      if ($elem.is(':visible'))
        stickyCheck(windowTop);
    });

    // this function returns element top in pixels
    // @param element
    function getElementTop(elem) {
      var pixels = 0;
      // if the element has parent
      if (elem.offsetParent) {
        // do..while loop
        do {
          // add the current element's offset top
          pixels += elem.offsetTop;
          // re-assign element to the parent
          elem = elem.offsetParent;
        } while (elem);
      }
      return pixels;
    }

    // this function checks if it should stick or not
    // @param window top value
    function stickyCheck(windowTop) {
      // if element top is less than window top call stickOn function
      if (elemTop < windowTop && !isSticking) {
        stickOn();
      } else if (elemTop >= windowTop && isSticking) {
        takeOff();
      }
    }

    // this function attach custom sticky id
    function stickOn() {
      isSticking = true;

      $elem.attr('id', 'custom-sticky-top');
      $('.cloned').show().css('visibility', 'hidden');
    }

    // this function take off custom sticky id
    function takeOff() {
      isSticking = false;
      $elem.removeAttr('id');
      $('.cloned').hide();
    }

    function createClone($elem) {
      // remove sticky attribute to prevent infinite loop
      var clone = $elem.removeAttr('sticky');
      clone = clone[0];
      // compile the clone
      $compile(clone)(scope, function(cloned, scope) {
        // attach to the bottom of element
        cloned.insertAfter($elem).addClass('cloned').removeClass('stackable').hide();
      });
    }
  }
});
//jscolor directive
app.directive('jsColor', function($timeout) {
  return function(scope, element, attrs) {
    $timeout(function() {
      jscolor.init();
    }, 200);
  };
});

app.directive('autoLink', function($location) {
  return {
    require: "?ngModel",
    link: function(scope, element, attrs, ngModel) {
      var $elem = element,
        elem = $elem[0],
        //protocol = $location.protocol();
        protocol = "https";

      elem.onblur = function() {
        var input = $elem.val().trim();
        if (input) {
          var chek_http = new RegExp("http");
          if (input.match(chek_http)) {
            var check = hasProtocol(input);
            if (!check) {
              scope.$apply(function() {
                var inp = input.substring(7);
                $elem.val(protocol + "://" + inp);
                ngModel.$setViewValue(protocol + "://" + inp);
              });
            }

          } else {
            scope.$apply(function() {
              $elem.val(protocol + "://" + input);
              ngModel.$setViewValue(protocol + "://" + input);
            });
          }
        }
      }

      function hasProtocol(input) {
        regex = new RegExp("^" + protocol);
        if (input.match(regex)) {
          return true;
        } else {
          return false;
        }
      }
    },
  }
});

app.directive('checkLink', function($location) {
  return {
    require: "?ngModel",
    link: function(scope, element, attrs, ngModel) {
      var $elem = element,
        elem = $elem[0],
        protocol = "http";
      elem.onblur = function() {
        var input = $elem.val().trim();
        if (input) {
          var check_http = hasProtocol(input);
          if (check_http) {} else {
            scope.$apply(function() {
              $elem.val(protocol + "://" + input);
              ngModel.$setViewValue(protocol + "://" + input);
            });
          }
        }
      }

      function hasProtocol(input) {
        regex = new RegExp("^" + protocol);
        if (input.match(regex)) {
          return true;
        } else {
          return false;
        }
      }
    },
  }
});

//wordpress post directive, post list in footer
app.directive('wpPost', function(API_URL, Restangular, $http, $sce, wpService) {
  return {
    restrict: 'E',
    scope: {
      options: '@'
    },
    link: function(scope, element, attrs) {
      scope.list_limit = 2;
      scope.posts = [];
      wpService.getPosts([], function() {
        scope.posts = wpService.posts;
      }, [], 2);
    },
    templateUrl: 'views/templates/partials/wordpress/wp-post-list-footer.html',
  }
});

app.directive('wpIndividualPost', function() {
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, element, attrs) {

    },
    templateUrl: 'views/templates/wp-post.html',
    controller: 'WPCtrl',
  }
});

app.directive('wpPostList', function(API_URL, Restangular, $http, $sce, wpService, $location, BLOG_SETTINGS, $routeParams) {
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, element, attrs) {
      var para = $location.search();
      scope.category_filter = [];
      scope.tag_filter = [];
      if (para.category) {
        scope.category_filter.push(para.category);
      }
      if (para.tag) {
        scope.tag_filter.push(para.tag);
      }
      if (para.s) {
        scope.s = para.s;
      }
      scope.current_page = 1;
      if ('page' in $location.search()) {
        scope.current_page = $location.search().page;
      }
      scope.list_limit = BLOG_SETTINGS.posts_per_page;
      wpService.getPosts(scope.category_filter, function() {
        scope.posts = wpService.posts;
        scope.totalPage = wpService.totalPage;
      }, scope.tag_filter, scope.list_limit, scope.current_page, scope.s);
      if (wpService.categories && wpService.categories.length) {
        scope.categories = wpService.categories;
      } else {
        wpService.getCategories(function() {
          scope.categories = wpService.categories;
        });
      }

    },
    templateUrl: 'views/templates/partials/wordpress/wp-post-list.html',
    controller: 'wpListCtrl',
  }
});

app.directive('semanticPagination', function() {
  return {
    restrict: 'EA',
    require: '?ngModel',
    scope: {
      pageUpdate: '&updateFunction',
      totalPages: '='
    },
    link: function(scope, element, attrs, ngModel) {
      // set current page and get pages
      function render() {
        scope.currentPage = parseInt(ngModel.$viewValue) || 1;
        scope.pages = getPages(scope.currentPage);
      }

      // once the totalPages has a value, run render function
      scope.$watch('totalPages', function(value) {
        if (value) {
          render();
        }
      });

      // this function generates pages array
      var start_num = 1;

      function getPages(currentPage) {
        // items per page set to 5, we can change this to be passed in.
        scope.itemsPerPage = 5;
        if (scope.totalPages < scope.itemsPerPage) {
          scope.itemsPerPage = scope.totalPages;
        }

        var end_num = Number(start_num) + Number(scope.itemsPerPage) - 1;
        var pages = [];
        if (currentPage > end_num) {
          start_num = currentPage - scope.itemsPerPage + 1;
          end_num = currentPage;
        }
        if (currentPage < start_num) {
          start_num = currentPage;
          end_num = currentPage + scope.itemsPerPage - 1;
        }

        if (start_num > 1) {
          var more = makePage(start_num - 1, '...', false);
          pages.push(more);
        }
        for (var num = start_num; num <= end_num; num++) {
          var page = makePage(num, num, num === currentPage);
          pages.push(page);
        }
        if (end_num < scope.totalPages) {
          var more = makePage(end_num + 1, '...', false);
          pages.push(more);
        }
        return pages;
      }

      // select a page
      scope.selectPage = function(page) {
        if (page < 1) {
          page = 1;
        }
        if (page > scope.totalPages) {
          page = scope.totalPages;
        }
        if (page >= 1 && page <= scope.totalPages) {
          ngModel.$setViewValue(page);
          render();
          scope.pageUpdate();
          // for comment sections
          if (attrs.paginationName && attrs.paginationName == "rewards") {
            window.scrollTo(0, $(".rewards").offset().top);
          } else if ($("#comment").offset()) {
            window.scrollTo(0, $("#comment").offset().top);
          }
          // for admin setting sections
          else if ($('table').length && $("table").offset().top) {
            window.scrollTo(0, $("table").offset().top);
          }
        }
      }

      // this function makes a page object
      function makePage(number, text, isActive) {
        return {
          number: number,
          text: text,
          active: isActive
        }
      }
      //<a class="icon item" ng-click="selectPage(currentPage-itemsPerPage)"><i class="angle double left icon"></i></a>
      //<a class="icon item" ng-click="selectPage(currentPage+itemsPerPage)"><i class="angle double right icon"></i></a>
    },
    template: '<div class="ui pagination menu" ng-show="pages.length > 1 && totalPages"><a class="icon item" ng-show="currentPage != 1" ng-click="selectPage(currentPage-1)"><i class="angle left icon"></i></a><a class="item" ng-repeat="page in pages track by $index" ng-class="{active: page.active}" ng-click="selectPage(page.number)">{{page.text}}</a><a class="icon item" ng-click="selectPage(currentPage+1)" ng-show="currentPage < totalPages"><i class="angle right icon"></i></a></div>'
  }
});

//twitter widget directive
app.directive('twitterTimeline', function(twitterWidgetService, $sce, $timeout) {
  return {
    restrict: "E",
    link: function(scope, elm, attr) {
      // var script = function() {
      // 	$('#twitter-wjs').remove();
      // 	$timeout(function() {
      // 		! function(d, s, id) {
      // 			var js, fjs = d.getElementsByTagName(s)[0],
      // 				p = /^http:/.test(d.location) ? 'http' : 'https';
      // 			if (!d.getElementById(id)) {
      // 				js = d.createElement(s);
      // 				js.id = id;
      // 				js.src = p + "://platform.twitter.com/widgets.js";
      // 				fjs.parentNode.insertBefore(js, fjs);
      // 			}
      // 		}(document, "script", "twitter-wjs");
      // 	}, 500);
      // }

      var init = function() {
        scope.widget = twitterWidgetService.widget_code;
        // script();
        scope.widget = $sce.trustAsHtml(scope.widget);
      }
      if (twitterWidgetService.widget_code.length) {
        scope.widget = twitterWidgetService.widget_code;
        scope.widget = $sce.trustAsHtml(scope.widget);
        // script();
      } else {
        twitterWidgetService.getWidgetCode(init);
      }
    },
    template: '<div ng-bind-html="widget"></div>',
  }
});

app.directive('htmlConvertToText', function() {
  return {
    restrict: "A",
    scope: {
      html: '=htmlConvertToText',
      max_char: '=maxChar',
    },
    link: function(scope, elm, attr) {

      var sourceStr = scope.html;
      var max_char = scope.max_char;

      elm.text(paragraphCutter(htmlToText(sourceStr), max_char));

      function htmlToText(html) {
        // let the browser convert html
        // we return the text
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      }

      function paragraphCutter(string, max_char) {
        if (string.length > max_char) {
          // if length is greater than the limit
          // cut the paragraph to max
          string = string.substr(0, max_char);
          var pos = string.lastIndexOf("\n\n");
          if (pos > -1) {
            // if the last index of two newlines is found
            // cut it to the new line
            string = string.substr(0, pos);
          } else {
            // else find the last index of one newline
            pos = string.lastIndexOf("\n");
            if (pos > -1) {
              string = string.substr(0, pos);
            } else {
              // append ...
              string += " ... View More";
            }
          }
        }
        return string;
      }
    },
  }
});

app.directive('onEnter', function() {
  return {
    restrict: "A",
    link: function(scope, elem, attrs) {
      elem.bind("keydown keypress", function(event) {
        // check enter key
        if (event.which === 13) {
          // apply function when key pressed
          scope.$apply(function() {
            scope.$eval(attrs.onEnter);
          });

          event.preventDefault();
        }
      })
    }
  };
});

app.directive('imageonload', function() {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      element.bind('load', function() {
        // Original states
        $('.ui.loader.download-loader').fadeOut();
        $('.ui.progress.upload-bar').fadeOut();
        $('.imagePlace .dimmer').dimmer('hide');
        $('.uploadImage').fadeOut();
      });
    }
  }
});

app.directive('campaignPlaceHolder', function() {
  return {
    link: function(scope, element, attrs) {
      $(element).next().css({
        'opacity': 0,
        'visibility': 'hidden',
        'position': 'absolute',
        'top': 0
      });
    }
  }
});

// Initial Semanitc UI tabular menu
app.directive('semanticUiTabs', function() {
  return {
    link: function(scope, element, attrs) {
      $(element).find('.tabular .item').tab();
    }
  }
});

app.directive('mediaElement', function() {
  return {
    link: function(scope, element, attrs) {
      $(element).mediaelementplayer({
        alwaysShowControls: false,
      });
    }
  }
});

app.directive('mediaElement', function() {
  return {
    link: function(scope, element, attrs) {
      $(element).mediaelementplayer({
        alwaysShowControls: false,
      });
    }
  }
});

app.directive('youtubeVideo', function($window, $q, $timeout) {
  return {
    restrict: "AE",
    link: function(scope, element, attrs) {

      scope.$watch(
        function() {
          return element[0].childNodes.length;
        },
        function(newValue, oldValue) {

          var onReady = function(event) {};
          if ((attrs.mute && attrs.mute == "true") ? 1 : 0) {
            onReady = function(event) {
              event.target.mute();
            };
          }

          var maxTries = 5;
          for (var count = 0; count < maxTries; count++) {
            try {
              setTimeout(function() {
                var ytPlayer = new YT.Player(attrs.id, {
                  playerVars: {
                    autoplay: (attrs.autoplay && attrs.autoplay == "true") ? 1 : 0,
                    controls: attrs.controls && attrs.controls == "true" ? 1 : 0,
                    modestbranding: attrs.modestBranding && attrs.modestBranding == "true" ? 1 : 0,
                    showinfo: attrs.showinfo && attrs.showinfo == "true" ? 1 : 0,
                    loop: attrs.loop && attrs.loop == "true" ? 1 : 0,
                    iv_load_policy: 3,
                    playlist: attrs.videoId,
                  },
                  videoId: attrs.videoId,
                  events: {
                    'onReady': onReady
                  }
                });
              }, 300);
              break;
            } catch (e) {
              count++;
              if (count >= maxTries) {
                break;
              }
            }
          }
        }
      );
    }
  }
});

app.directive('myTarget', function() {
  return {
    restrict: 'A',
    link: function($scope, $element, $attrs) {
      var linkid = $attrs["myTarget"];
      if (!linkid) {
        $element.attr('target', '_blank');
      }
    }
  }
});

app.directive('setVideoThumbHeight', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      $timeout(function() {
        var VidThumbResize = function() {

          var screenSize = $(window).width();
          var imgHeight = element.find('.placeholder-img').height();


          if (screenSize > 0) {
            $('.video-container').css('height', imgHeight);
          }
        }

        VidThumbResize();

        $(window).resize(function() {
          VidThumbResize();
        });
      });
    }
  }
});

// Calls the function on attribute on-scroll-bottom when the scroll has reached the bottom.
app.directive('onScrollBottom', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('scroll', function() {
        var current_scroll = element[0].scrollTop + element[0].offsetHeight;
        if (current_scroll > element[0].scrollHeight) {
          scope.$apply(attrs.onScrollBottom);
        }
      });
    }
  };
});

// Calls when enter key is pressed on input element
app.directive('enterKeyPress', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if (event.which === 13) {
        scope.$apply(function() {
          if (typeof attrs.enterKeyPress === "function") {
            scope.$eval(attrs.enterKeyPress);
          }
        });
        event.preventDefault();
        return false;
      }
    });
  };
});

app.directive("inputColor", function($timeout) {
  return {
    restrict: "A",
    link: function(scope, element, attribute) {
      scope.$watch(function() {
        return $(element).val();
      }, function(newValue, oldValue) {
        if (newValue != oldValue && newValue) {
          $(element).css("background-color", "#" + $(element).val());

          var threshHold = 105;
          var rgb = getRGBComponents($(element).val());
          var bgDelta = (rgb.R * 0.299) + (rgb.G * 0.587) + (rgb.B * 0.114);
          var fgColor = ((255 - bgDelta) < threshHold) ? "#000" : "#FFF";

          $(element).css("color", fgColor);

          function getRGBComponents(bgColor) {
            var r = bgColor.substr(0, 2);
            var g = bgColor.substr(2, 2);
            var b = bgColor.substr(4, 2);

            return {
              "R": parseInt(r, 16),
              "G": parseInt(g, 16),
              "B": parseInt(b, 16)
            }
          }
        }
      });
    }
  };
});

app.directive("widgetCodeSelect", function($timeout) {
  return {
    restrict: "A",
    link: function(scope, element, attribute) {
      $timeout(function() {
        $('#embed-code br').remove();
        // $('#embed-code').click();
        selectEmbedCode();
        $('#embed-code').click(function() {
          selectEmbedCode();
        });

        function selectEmbedCode() {
          $('#selectable-code').val($('#embed-code').text()).show();
          $('#embed-code').hide();
          $('#selectable-code').focus().select();
        }

        function deselectEmbedCode() {
          $('#embed-code').val($('#embed-code').text()).show();
          $('#selectable-code').hide();
        }
        $('#selectable-code').blur(function() {
          deselectEmbedCode();
        });
      });
    }
  };
});

app.directive('scrollTo', ['ScrollTo', function(ScrollTo) {
    return {
      restrict: "AC",
      compile: function() {

        return function(scope, element, attr) {
          element.bind("click", function(event) {
            ScrollTo.idOrName(attr.scrollTo, attr.offset);
          });
        };
      }
    };
  }])
  .service('ScrollTo', ['$window', 'ngScrollToOptions', function($window, ngScrollToOptions) {

    this.idOrName = function(idOrName, offset, focus) { //find element with the given id or name and scroll to the first element it finds
      var document = $window.document;

      if (!idOrName) { //move to top if idOrName is not provided
        $window.scrollTo(0, 0);
      }

      if (focus === undefined) { //set default action to focus element
        focus = true;
      }

      //check if an element can be found with id attribute
      var el = document.getElementById(idOrName);
      if (!el) { //check if an element can be found with name attribute if there is no such id
        el = document.getElementsByName(idOrName);

        if (el && el.length)
          el = el[0];
        else
          el = null;
      }

      if (el) { //if an element is found, scroll to the element
        if (focus) {
          el.focus();
        }

        ngScrollToOptions.handler(el, offset);
      }

      //otherwise, ignore
    }

  }])
  .provider("ngScrollToOptions", function() {
    this.options = {
      handler: function(el, offset) {
        if (offset) {
          var top = $(el).offset().top - offset;
          window.scrollTo(0, top);
        } else {
          el.scrollIntoView();
        }
      }
    };
    this.$get = function() {
      return this.options;
    };
    this.extend = function(options) {
      this.options = angular.extend(this.options, options);
    };
  });

app.directive('disableLink', function() {
  return {
    restrict: 'A',
    scope: {
      enabled: '=disableLink'
    },
    link: function(scope, elem, attr) {
      elem.click(function(event) {
        if (scope.enabled) {
          event.preventDefault();
        }
      });
    }
  }
});

app.directive('dynFbCommentBox', function() {
  function createHTML(href, numposts, colorscheme) {
    return '<div class="fb-comments" ' +
      'data-href="' + href + '" ' +
      'data-numposts="' + numposts + '" ' +
      'data-colorsheme="' + colorscheme + '">' +
      '</div>';
  }

  return {
    restrict: 'A',
    scope: {},
    link: function postLink(scope, elem, attrs) {
      attrs.$observe('pageHref', function(newValue) {
        var href = newValue;
        var numposts = attrs.numposts || 5;
        var colorscheme = attrs.colorscheme || 'light';

        elem.html(createHTML(href, numposts, colorscheme));
        FB.XFBML.parse(elem[0]);
      });
    }
  };
});

app.directive('thrinaciaFileUpload', function() {
  return {
    restrict: 'E',
    scope: { uploadFile: '&', uploadId: '=' },
    template: '<label for="{{uploadId}}_{{index}}" class="ui {{additionalClasses}} labeled icon button {{disabled}}">' +
      '<i class="upload icon"></i> {{uploadTranslate|translate}}' +
      '</label>' +
      '<input id="{{uploadId}}_{{index}}" type="file" data-index="{{index}}" onchange="angular.element(this).scope().fileNameChanged()" style="display:none" {{disabled}}/>',
    link: function(scope, elem, attr) {
      scope.uploadId = attr.uploadId;
      scope.uploadTranslate = attr.uploadTranslate;
      scope.index = attr.uploadIndex;
      if (attr.uploadDisabled == true) {
        scope.disabled = "disabled";
      } else {
        scope.disabled = "";
      }
      if (attr.additionalClasses) {
        scope.additionalClasses = attr.additionalClasses;
      } else {
        scope.additionalClasses = "";
      }
      scope.fileNameChanged = function(event) {
        if (scope.index) {
          var file = angular.element('#' + attr.uploadId + '_' + scope.index)[0].files;
          var index = angular.element('#' + attr.uploadId + '_' + scope.index)[0].getAttribute('data-index');
          scope.uploadFile()(file, index);
        } else {
          var file = angular.element('#' + attr.uploadId + '_')[0].files;
          scope.uploadFile()(file);
        }
      }
    }
  };
});