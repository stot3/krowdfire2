app.controller('MessageCenterCtrl', function ($scope, $sce, $rootScope, $timeout, Restangular, $translatePartialLoader, $translate, RestFullResponse, $location, $routeParams) {
  $scope.clearMessage = function () {
    $rootScope.floatingMessage = [];
  }
  var msg;
  $scope.sendMessage = {};

  // initialize semantic tabs
  $('#message-tabs .menu-tabs .item').tab({
    context: $('#message-tabs')
  });

  // request to get message
  function getMessage() {
    $scope.inbox = [];
    $scope.sent = [];
    $scope.message = {};
    $scope.messageSelected = false;

    Restangular.one('account').customGET('message', {
      sort: '-created'
    }).then(function (messages) {
      $scope.$emit("loading_finished");

      // store in scope variable
      $scope.messages = messages;
      $rootScope.checkmessage = $scope.messages;
      // filter out the messages inbox or sent
      angular.forEach(messages, function (value) {
        value.body = value.body.replace(/<br>/g, "\r\n");
        if (value.message_type == 'Message To') {
          $scope.inbox.push(value);
        } else if (value.message_type == 'Message From') {
          $scope.sent.push(value);
        }
      });


      // if inbox has message,  open the first message by default
      if ($scope.inbox.length) {
        // sort the messages by created
        var temp = "";
        var index = -1;
        angular.forEach($scope.inbox, function (value, key) {

          if (value.created > temp) {
            temp = value.created;
            index = key;
          }
        });
        $scope.message = $scope.inbox[index];
        $scope.hasMessage = true;
        $scope.inboxSelected = 0;
        $scope.personid = $scope.inbox[index].person_id_sender;

      } else {
        $scope.hasMessage = false;
      }

      Restangular.one('account/person', $scope.personid).customGET().then(function (success) {
        $scope.personDetail = success.plain();
        $scope.files = $scope.personDetail.files;
        if ($scope.files) {
          $scope.filelength = $scope.files.length;
          if ($scope.files.length) {
            $scope.imageurl = $scope.files[0].path_external;
          }
        }
      });

      //to check for message id and display the message (when visitng through the link)
      var testindex = 0;

      if ($location.search()) {

        angular.forEach($scope.inbox, function (value, key) {
          $scope.personid = $routeParams.person_id
          if (value.message_id == $routeParams.message_id) {
            $scope.message = $scope.inbox[testindex];
            $scope.hasMessage = true;
            $scope.inboxSelected = testindex;
          }
          testindex = testindex + 1;
        });


      }

    });

    Restangular.one('account/person', $scope.personid).customGET().then(function (success) {

      $scope.personDetail = success.plain();
      $scope.files = $scope.personDetail.files;
      $scope.filelength = $scope.files.length;
      if ($scope.files.length) {
        $scope.imageurl = $scope.files[0].path_external;
      }
    });
  }

  getMessage();

  // function to view message when click
  $scope.messageDetail = function (message, index, identifier) {
    if (message) {
      $scope.hasMessage = true;
    } else {
      $scope.hasMessage = false;
    }

    message.body = message.body.replace(/<br>/g, "\r\n");

    if (identifier == 'inbox') {
      $scope.inboxSelected = index;
      $scope.sentSelected = null;
      $scope.personid = $scope.inbox[index].person_id_sender;
    } else if (identifier == 'sent') {
      $scope.sentSelected = index;
      $scope.inboxSelected = null;
      $scope.personid = $scope.sent[index].person_id_receiver;
    }
    $scope.message = message;
    Restangular.one('account/person', $scope.personid).customGET().then(function (success) {

      $scope.personDetail = success.plain();
      $scope.files = $scope.personDetail.files;
      if ($scope.files) {
        if ($scope.files.length > 0) {
          $scope.imageurl = $scope.files[0].path_external;
        }
      }

    });
  }

  // function to delete message
  $scope.messageDelete = function () {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    if ($scope.message.id) {
      Restangular.one('account/message', $scope.message.id).customDELETE().then(function (success) {
        getMessage();
        msg = {
          header: 'message_center_delete_success'
        };
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      }, function (failed) {
        msg = {
          header: failed.data.message,
        };
        $rootScope.floatingMessage = msg;
        $scope.hideFloatingMessage();
      });
    }
  }

  $scope.openModalById = function (id) {
    $('.ui.modal#' + id).modal('show');
  }

  // fill reply with some existing content
  $scope.replyPrefill = function () {
    $scope.sendMessage = {
      subject: "Re: " + $scope.message.subject,
      body: "\n<<<<<<<<<<<<<<<<< Original Message >>>>>>>>>>>>>>>>>\n" + $scope.message.body,
    };
  }

  $scope.send = function () {
    //$scope.clearMessage();
    msg = {
      'loading': true,
      'loading_message': 'in_progress'
    }
    $rootScope.floatingMessage = msg;
    $scope.sendMessage['person_id'] = $scope.message.person_id_sender;
    $scope.sendMessage.body = $scope.sendMessage.body.replace(/(\r\n|\n|\r)/gm, "<br>");
    Restangular.one('account/message').customPOST($scope.sendMessage).then(function () {
      // update sent box
      $scope.sent.push($scope.sendMessage);
      // reset scope variable
      $scope.sendMessage = {};
      msg = {
        header: 'message_center_sent_success'
      };
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    }, function (failed) {
      msg = {
        header: failed.data.message,
      };
      $rootScope.floatingMessage = msg;
      $scope.hideFloatingMessage();
    });
  }

  //Refresh Messages after composing
  $scope.$on('composed_new_message', function () {
    getMessage();
  });

});