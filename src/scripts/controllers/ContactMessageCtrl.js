/*
 * Controller for contact modal.
 *****************************************************/
app.controller('ContactMessageCtrl', function ($scope, $rootScope, Restangular, PortalSettingsService, $translate, UserService, RestFullResponse, $timeout) {
    $scope.receiver = {};
    $scope.message = {
        'first_name': '',
        'last_name': '',
        'email': '',
    };
    $scope.user_list_page = 1;
    $scope.user_list_page_entries = 10;
    var msg;

    $scope.isLoggedin = UserService.isLoggedIn();


    PortalSettingsService.getSettingsObj().then(function (success) {
        $scope.isAllowAnonContactMsg = success.public_setting.site_allow_anonymous_contact_message;
    });

    $scope.showContactModal = function (user) {
        if(user){
            $scope.receiver = user;
        }

        if (UserService.isLoggedIn() || $scope.isAllowAnonContactMsg) {
            if (!user) {
                if ($('.contact-user-modal').modal('is active')) {
                    $('.ui modal').modal('hide all');
                    $('.ui dimmer').dimmer('hide');
                }
                $('.contact-user-modal').modal('show');
                $('.contact-user-modal').modal('setting', {
                    onApprove: $scope.sendUserMessage
                });
            } else {
                if ($('.contact-message-modal').modal('is active')) {
                    $('.ui modal').modal('hide all');
                    $('.ui dimmer').dimmer('hide');
                }
                $('.contact-message-modal').modal('show');
                $('.contact-message-modal').modal('setting', {
                    onApprove: $scope.sendContactMessage
                });
            }
        } else {
            $('.log-in-required-modal').modal('show');
        }
    }

    // Validate message form
    $scope.validateMessage = function (form_target) {
        var translation = $translate.instant(['contact_message_missing_subject', 'contact_message_missing_body', 'contact_message_missing_recipient', 'contact_message_missing_first_name', 'contact_message_missing_last_name', 'contact_message_missing_email', 'contact_email_validate_error']);
        var fields = {
            subject: {
                identifier: 'subject',
                rules: [{
                    type: 'empty',
                    prompt: translation.contact_message_missing_subject
                }]
            },
            body: {
                identifier: 'body',
                rules: [{
                    type: 'empty',
                    prompt: translation.contact_message_missing_body
                }]
            },
            recipient: {
                identifier: 'recipient',
                rules: [{
                    type: 'empty',
                    prompt: translation.contact_message_missing_recipient
                }]
            },
            first_name: {
                identifier: 'first_name',
                rules: [{
                    type: 'empty',
                    prompt: translation.contact_message_missing_first_name
                }]
            },
            last_name: {
                identifier: 'last_name',
                rules: [{
                    type: 'empty',
                    prompt: translation.contact_message_missing_last_name
                }]
            },
            email: {
                identifier: 'email',
                rules: [{
                        type: 'empty',
                        prompt: translation.contact_message_missing_email
                    },
                    {
                        type: 'email',
                        prompt: translation.contact_email_validate_error
                    }
                ]
            },
        };

        if (form_target == "contact-message") {
            $('.ui.form.contact-message').form(fields, {
                inline: true,
                onSuccess: function () {
                    $scope.validMessage = true;
                },
                onFailure: function () {
                    $scope.validMessage = false;
                }
            }).form('validate form');
        }
        if (form_target == "contact-user") {
            $('.ui.form.contact-user').form(fields, {
                inline: true,
                onSuccess: function () {
                    $scope.validMessage = true;
                },
                onFailure: function () {
                    $scope.validMessage = false;
                }
            }).form('validate form');
        }
    }

    // Sends contact message to a preset user.
    $scope.sendContactMessage = function () {
        $scope.validateMessage("contact-message");

        if ($scope.validMessage) {
            // Need to replace newline with actual html tags to render properly in email clients
            $scope.message.body = $scope.message.body.replace(/(\r\n|\n|\r)/gm, "<br>");
            $scope.message['person_id'] = $scope.receiver.id;
            msg = {
                loading_message: "action_sending",
                loading: true
            }
            $rootScope.floatingMessage = msg;

            Restangular.one('account/message').customPOST($scope.message).then(
                function (success) {
                    $translate('message_sentto').then(function (value) {
                        msg = {
                            'header': value + " " + $scope.receiver.first_name + " " + $scope.receiver.last_name,
                        };
                        $rootScope.floatingMessage = msg;
                        $scope.hideFloatingMessage();
                    });
                    $scope.cleartext();
                    $timeout(function(){
                        var clickElem = document.querySelector('[data-tab="inbox"]');
                        angular.element(clickElem).triggerHandler('click')
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
            $('.contact-message-modal').modal('hide');
        } else {
            return false;
        }
    }

    // Send message to a receiver specified by the user.
    $scope.sendUserMessage = function () {
        $scope.validateMessage("contact-user");
        if ($scope.validMessage) {
            // Need to replace newline with actual html tags to render properly in email clients
            var data = {
                "body": $scope.message.body.replace(/(\r\n|\n|\r)/gm, "<br>"),
                "person_id": $scope.receiver.id,
                "subject": $scope.message.subject
            };
            msg = {
                loading_message: "action_sending",
                loading: true
            };
            $rootScope.floatingMessage = msg;
            Restangular.one('account/message').customPOST(data).then(
                function (success) {
                    $translate('message_sentto').then(function (value) {
                        msg = {
                            'header': value + " " + $scope.receiver.first_name + " " + $scope.receiver.last_name,
                        };
                        $rootScope.floatingMessage = msg;
                        $scope.hideFloatingMessage();
                    });
                    $scope.cleartext();
                    // Update Message Center
                    $scope.$emit("composed_new_message");
                    $timeout(function(){
                        var clickElem = document.querySelector('[data-tab="inbox"]');
                        angular.element(clickElem).triggerHandler('click')
                    });
                },
                function (failure) {
                    msg = {
                        'header': failure.data.message,
                    };
                    $rootScope.floatingMessage = msg;
                    $scope.hideFloatingMessage();
                }
            );
            $('.contact-user-modal').modal('hide');
        } else {
            return false;
        }
    }

    // Sets the values of the user to send a message to.
    $scope.setRecipient = function (event) {

        var first_name = event.target.attributes["first-name"].value;
        var last_name = event.target.attributes["last-name"].value;
        var id = event.target.attributes["data-value"].value;

        $scope.receiver.id = id;
        $scope.receiver.first_name = first_name;
        $scope.receiver.last_name = last_name;
    }

    // Sets the values of the user to send a message to.
    $scope.setRecipientOnEnter = function (event) {
        // Only update on enter key
        if (event.keyCode == 13) {
            var updatedRecipient = angular.element("div.to-user a.profile-link");
            var first_name = updatedRecipient[0].attributes["first-name"].value;
            var last_name = updatedRecipient[0].attributes["last-name"].value;
            var id = updatedRecipient[0].attributes["user-id"].value;

            $scope.receiver.id = id;
            $scope.receiver.first_name = first_name;
            $scope.receiver.last_name = last_name;
        }
    }

    // Get new list of users.
    $scope.updateUserList = function (name) {
        // Reset to first page.
        $scope.user_list_page = 1;
        $scope.getPeopleNames(name);
    }

    // Get list of usernames for composing messages
    $scope.getPeopleNames = function (name, append) {
        $scope.append = false;
        if (append !== undefined) {
            $scope.append = append;
        }
        var filters = {
            "filters": {
                "name": name,
            },
            "page": $scope.user_list_page,
            "page_entries": $scope.user_list_page_entries,
        }
        /*Restangular.one("portal/person-public").get(filters).then(function(success, limit){*/
        RestFullResponse.all('portal/person-public').getList(filters).then(function (success) {
            $scope.pagination_info = success.headers();

            if (!$scope.append) {
                $scope.list_users = [];
            }

            for (var i in success.data) {
                if (success.data[i] !== undefined &&
                    success.data[i] !== null &&
                    typeof success.data[i] == "object") {
                    if ("id" in success.data[i]) {
                        $scope.list_users.push(success.data[i]);
                    }
                }
            }

            // Need timeout or semantic function will not run correctly.
            // Show drop down if more results are found since semantic hides dropdown before api result is returned.
            $timeout(function () {
                if ($scope.list_users.length > 0) {
                    $(".recipient.dropdown").dropdown("show");
                }
            }, 0);

        }, function (failed) {
            $scope.list_users = false;
        });
    }

    // Adjust page number variable.
    var pageAdjust = function (adjust) {
        if ($scope.user_list_page + adjust > 0) {
            $scope.user_list_page += adjust;
        }
    }

    // Increments page and append to current list of users.
    $scope.appendNextPage = function () {
        // Don't try to add next page if already on the last page.
        if ($scope.user_list_page >= $scope.pagination_info["x-pager-last-page"]) {
            return;
        }
        pageAdjust(1);
        $scope.getPeopleNames($scope.message.receiver, true);
    }

    // Increment page number and retreive new list of users.
    $scope.nextPage = function () {
        pageAdjust(1);
        $scope.getPeopleNames($scope.message.receiver);
    }

    // Decrement page number and retreive new list of users.
    $scope.previousPage = function () {
        pageAdjust(-1);
        $scope.getPeopleNames($scope.message.receiver);
    }

    // Clears the form data.
    $scope.cleartext = function () {
        $('#subject').val('');
        $('#message').val('');
        $('#subject-user').val('');
        $('#message-user').val('');
        if ($scope.message !== undefined) {
            if ("subject" in $scope.message) {
                $scope.message.subject = "";
            }
            if ("body" in $scope.message) {
                $scope.message.body = "";
            }
            if ("first_name" in $scope.message) {
                $scope.message.first_name = "";
            }
            if ("last_name" in $scope.message) {
                $scope.message.last_name = "";
            }
            if ("email" in $scope.message) {
                $scope.message.email = "";
            }
        }
    }

    // Load list of users on load.
    $scope.getPeopleNames("");
});
