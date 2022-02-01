app.controller('CreatorInviteCtrl', function($scope, UserService, CreatorInviteService, CreateCampaignService, $routeParams){
    $scope.emails = { }; 
    $scope.campaign_id = $routeParams.campaign_id;
    $scope.loading = 'not started';  
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
    $scope.sendEmails = function(emails){
        let sendObj = emails; 
        $scope.loading = 'started'; 

        if($scope.loading === 'started')
        {
            return UserService.getPaidStatus(UserService.email)
            .then(
                (response) => { 
                    for(let person = 1; person <7; person++){
                        if(emails[`email${person}`] !== undefined && emails[`name${person}`] !== undefined){
                            if(emails[`email${person}`] !== "" && emails[`name${person}`] !== ""){
                                
                                if(person % 2 === 0){
                                    sendObj[`campaign_id${person}`] = $routeParams.campaign_id
                                    sendObj[`campaign_name${person}`] = $scope.campaign_name
                                }
                                else{
                                    sendObj[`campaign_id${person}`] = response.data.info.inviterInformation.campaign_id
                                    sendObj[`campaign_name${person}`] = response.data.info.inviterInformation.campaign_name
                                }
                            }
                        }
                    }
                    sendObj.uid = response.data.info.id
                    CreatorInviteService.sendEmails(sendObj)
                    .then( (invitationResponse) => {
                    if(invitationResponse.data.info.code === "email/successfulSend"){
                        $('#invitedParticipants').progress('increment', parseInt(invitationResponse.data.info.successfulSends))
                    }
                    $scope.loading = 'finished'
                    })
                    .catch( (err) => {
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
    
})