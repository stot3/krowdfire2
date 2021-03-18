app.controller('StreamManageCtrl', function($scope, $location, $routeParams, $timeout, Restangular, RESOURCE_REGIONS, $translatePartialLoader, $translate, $rootScope) {

  $scope.clearMessage = function() {
    $rootScope.floatingMessage = [];
  }
  var msg;
  $scope.RESOURCE_REGIONS = RESOURCE_REGIONS;
  var campaign_id = $routeParams.campaign_id || null;
  $scope.campaign = {};
  $scope.campaign.backers = [];

  $scope.multiBacker = {};

  // Variable to save what the stream is that's currently being edited
  var currentEditedStream;

  $scope.stream = {};
  $scope.stream.stream_type_id = 1; //default to 1
  $scope.stream.html = "";
  $scope.showSection = {
    streamForm: false,
  };

  if (campaign_id) {
    getCampaignData();
  } else {
    $scope.$emit("loading_finished");
  }

  function getCampaignData() {
    Restangular.one('campaign').customGET(campaign_id).then(function(success) {
      $scope.campaign = success;
      $scope.editCampaignStream($scope.campaign);
      $scope.$emit("loading_finished");
    });
  }

  $scope.editCampaignStream = function(campaign) {
    $scope.campaign = campaign;
    $scope.add_stream_preview = false;
    $scope.stream['entry_id'] = $scope.campaign.entry_id;
    $scope.backers = [];
    Restangular.one('campaign/' + campaign.id.toString() + '/stream').getList(null, {
      "sort": "-modified"
    }).then(
      function(success) {
        $scope.streams = success || {};
      },
      function(failure) {

      });
    Restangular.one('campaign/' + campaign.id.toString() + '/backer').getList().then(
      function(success) {
        $scope.campaign.backers = success;
      });
  }

  $scope.pageInsertImage = function(file, e) {
    var target = $(e.target).closest('.stream-message');
    $scope.textAngularFile(file[0], target);
  };

  $scope.saveStream = function() {
    //$scope.clearMessage();
    // if id already exists, the user is editing
    if ($scope.stream.id) {
      // Update the stream object with the newly edited one
      currentEditedStream.message = $scope.stream.message;
      $scope.updateStream();
    }
    // user adding
    else {
      $scope.createStream();
    }
  }

  $scope.createStream = function() {
    if($scope.stream.title == null){
      msg = {
        'header': 'Stream title is required.',
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
      $scope.stream.has_error = true;
      return;
    }
    //$scope.clearMessage();
    // if ($scope.stream.title && $scope.stream.message && $scope.stream.stream_type_id) {
    var lst = [];
    if ($scope.stream.stream_type_id == 3) {
      angular.forEach($scope.multiBacker.selected, function(value) {
        lst.push(value.person_id);

      });
      $scope.stream['person_id'] = lst;
      if (lst.length == 0) {
        msg = {
          'header': 'Please select backers',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        return;
      }
    }
    msg = {
      'loading':true,
      'loading_message':'in_progress'
    }
    $rootScope.floatingMessage = msg;
    Restangular.one('campaign/' + $scope.campaign.entry_id.toString() + '/stream').customPOST($scope.stream).then(function(success) {
      $scope.showSection.streamForm = false;
      $scope.streams.unshift(success);
      $translate(['stream_create_prefix', 'stream_create_suffix']).then(function(translation) {
        msg = {
          'header': translation.stream_create_prefix + ' ' + success.title + ' ' + translation.stream_create_suffix,
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      })
    }, function(failure) {
      msg = {
        'header': failure.data.message
      }
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });

  }

  $scope.clearStream = function() {
    $scope.stream = {
      stream_type_id: 1,
    };
  }

  $scope.editStream = function(stream) {
    // Keep a reference of the stream
    currentEditedStream = stream;
    // Make a copy of the stream object by primitive way
    // This is to avoid how html-render directive is listening to the change in stream object
    $scope.stream = {};
    for (var p in stream) {
      if (stream.hasOwnProperty(p)) {
        $scope.stream[p] = stream[p];
      }
    }
    $timeout(function() {
      $('.ui.dropdown').dropdown('set selected', $scope.stream.stream_type_id);
    });
  }

  $scope.$watch('stream.stream_backers', function(value) {
    if (value) {
      $scope.campaign.backers = value;
      $scope.multiBacker.selected = value;
    }
  });

  $scope.publishStream = function(stream, bool) {
    //$scope.clearMessage();
    $scope.publishBool = bool;
    if (bool === false) {
      bool = 'f';
    } else {
      bool = 't';
    }
    $('#publish-stream').modal({
      onApprove: function() {
        var data = {
          published: bool,
        };
        msg = {
          'loading':true,
          'loading_message':'in_progress'
        }
        $rootScope.floatingMessage = msg;
        Restangular.one('campaign/' + $scope.campaign.id + '/stream/' + stream.id).customPUT(data).then(function(success) {
          $translate(['stream_update_prefix', 'stream_update_suffix']).then(function(translation) {
            msg = {
              'header': translation.stream_update_prefix + ' ' + success.title + ' ' + translation.stream_update_suffix,
            }
            if ($scope.publishBool === false) {
              stream.published = false;
            } else {
              stream.published = true;
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
          })

        }, function(failure) {
          msg = {
            'header': failure.data.message
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      }
    }).modal('show');

  }

  $scope.updateStream = function() {
    //$scope.clearMessage();
    $scope.showSection.streamForm = false;
    if ($scope.stream.stream_type_id == 3) {
      angular.forEach($scope.multiBacker.selected, function(value) {
        lst.push(value.person_id);
      });

      $scope.stream['person_id'] = lst;
      if (lst.length == 0) {
        msg = {
          'header': 'Please select backers',
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
        return;
      }
    }
    msg = {
      'loading':true,
      'loading_message':'in_progress'
    }
    $rootScope.floatingMessage = msg;

    Restangular.one('campaign/' + $scope.campaign.entry_id.toString() + '/stream/' + $scope.stream.stream_id.toString()).customPUT($scope.stream).then(
      function(success) {
        getCampaignData();
        $translate(['stream_update_prefix', 'stream_update_suffix']).then(function(translation) {
          msg = {
            'header': translation.stream_update_prefix + ' ' + success.title + ' ' + translation.stream_update_suffix,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        })
      },
      function(failure) {
        msg = {
          'header': failure.data.message
        }
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });

  }

  $scope.deleteStream = function(streamID) {
    //$scope.clearMessage();

    $('#delete-stream').modal({
      onApprove: function() {
        msg = {
          'loading':true,
          'loading_message':'in_progress'
        }
        $rootScope.floatingMessage = msg;
        Restangular.one('campaign/' + $scope.campaign.entry_id + '/stream/' + streamID).customDELETE().then(function(success) {
          $translate('stream_delete').then(function(translation) {
            msg = {
              'header': translation,
            }
            $rootScope.floatingMessage = msg;
            $scope.hideFloatingMessage();
          });
          for (var j = 0; j < $scope.streams.length; j++) {
            if (success.id == $scope.streams[j].id) {
              $scope.streams.splice(j, 1);
            }
          }
        }, function(failure) {
          msg = {
            'header': failure.data.message,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      }
    }).modal('show');

  }

  $scope.notifyBacker = function(stream) {
    //$scope.clearMessage();
    $('#notify-backers').modal({
      onApprove: function() {
        var stream_id = stream.id;
        msg = {
          'loading':true,
          'loading_message':'in_progress'
        }
        $rootScope.floatingMessage = msg;
        Restangular.one('campaign/' + $scope.campaign.id + '/stream-notify/' + stream_id).customPOST().then(function(success) {
          msg = {
            'header': 'Notify backers successfully',
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        }, function(failure) {
          msg = {
            'header': failure.data.message,
          }
          $rootScope.floatingMessage = msg;
          $scope.hideFloatingMessage();
        });
      }
    }).modal('show');

  }


  $scope.updateBackerList = function(term) {
    $form = {
      'filters': {
        'person_name': term,
      }
    }
    if ($scope.campaign.entry_id) {
      Restangular.one('campaign/' + $scope.campaign.entry_id.toString()).getList('backer', $form).then(
        function(success) {
          $scope.campaign.backers = success;
        })
    }
  }
});