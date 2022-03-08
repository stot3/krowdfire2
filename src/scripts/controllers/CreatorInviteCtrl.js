app.controller('CreatorInviteCtrl', function($scope, UserService, CreatorInviteService, CreateCampaignService, $routeParams){
    $scope.emails = { };
    $scope.campaign_id = $routeParams.campaign_id;
    $scope.loading = 'not started';  
    $scope.inviteesTables = [
    ]
    $('#invitedParticipants').progress(
        {
            total: 6,
            text: {
                active: '{value} invited participants',
                success: '{total} invited particpants'
            }
        }
    )
    CreateCampaignService.load($routeParams.campaign_id)
    .then(
        data => {
                $scope.campaign_name = data.name
        }
    )  
    .catch( 
        (error) => { console.error(error)}
    )
    UserService.getProfile().then(
        (profile) => {
            const inviterInformation = profile.data.info.invitedFundraisers;
           if(inviterInformation !== undefined){
               for(let email in inviterInformation){
                   $scope.inviteesTables.push({email: email})
               }
           }
        }
    )
    .catch( 
        (err) => { 
            console.error(err)
        }
    )
    $scope.sendEmails = function(emails){
        let sendObj = emails; 
        sendObj[`campaign_id`] = $routeParams.campaign_id
        sendObj[`campaign_name`] = $scope.campaign_name
        $scope.loading = 'started'; 

        if($scope.loading === 'started')
        {
            return UserService.getPaidStatus(UserService.email)
            .then(
                (response) => { 
                    sendObj.uid = response.data.info.id
                    return CreatorInviteService.sendEmails(sendObj)
                    .then( (invitationResponse) => {
                        if(invitationResponse.data.info.code === "email/successfulSend"){
                            $('#invitedParticipants').progress('increment', parseInt(invitationResponse.data.info.successfulSends))
                        }
                        $scope.loading = 'finished';
                        $scope.inviteesTables = []
                        const invited = invitationResponse.data.info.invitedFundraisers;
                        for(let email in invited ){
                            $scope.inviteesTables.push({email: email})
                        }

                    })
                    .catch( (err) => {
                        console.error(err)
                    }) 
                    
                }
            )
            .catch(
                err => { 
                    console.error(err)
                }
            )
        }
        
        //CreatorInviteService.sendEmails($scope.emails)
    }
    $scope.removeInviter = function(idx){
    }
    $scope.resendInvitation = function(){}
    $scope.removeFromInviteesTable = function(idx){
        $scope.loading = 'loading';
        //$scope.inviteesTables.splice(idx, 1)
    }    
    
})