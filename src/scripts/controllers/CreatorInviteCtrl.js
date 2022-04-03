app.controller('CreatorInviteCtrl', function($scope, $location, UserService, CreatorInviteService, CreateCampaignService, $routeParams){
    $scope.emails = { };
    $scope.campaign_id = $routeParams.campaign_id;
    $scope.loading = false;   
    $scope.inviteesTables = [
    ]
    $scope.campaignInvitees = []
    $scope.campaignInviteesLen = $scope.campaignInvitees.length;
    $scope.campaign_pathname = ""
    $('#invitedParticipants').progress(
        {
            total: 6,
            text: {
                active: '{value} invited participants',
                success: '{total} invited particpants'
            }
        }
    )
    if (!UserService.isLoggedIn()) {
        $location.path('login');
    }
    CreateCampaignService.load($routeParams.campaign_id)
    .then(
        data => {

                $scope.campaign_name = data.name
                $scope.campaign_pathname = data.uri_paths[0].path.split("/").pop()
                return UserService.getProfile().then(
                    (profile) => {
                        const inviterInformation = profile.data.info.invitedFundraisers;
                        const successAndInsurancePolicy = profile.data.info.campaignSuccess;
                        const campaignInvitees = profile.data.info[`${data.name}_invitees`];
                        const pickSixComplete = profile.data.info.congratulationsPickSixComplete;
                        const userPaid = profile.data.info.paid;
                        if(userPaid != undefined && userPaid === true){
                            $location.path("")
                        }
                       if(inviterInformation !== undefined){
                           for(let email in inviterInformation){
                               if(email.startsWith(`${$routeParams.campaign_id}_`)){
                                    const campaignEmail = email.split("_")[1];
                                    $scope.campaignInvitees.push({email: campaignEmail, status: inviterInformation[email].status, dateAdded: inviterInformation[email].dateAdded})
                                    $scope.campaignInviteesLen += 1; 
                               }
                               else{
                                   if(email.split("_").length !== 3)
                                    {
                                        $scope.inviteesTables.push({email: email, status: inviterInformation[email].status, dateAdded: inviterInformation[email].dateAdded})
                                    }
                               }
                           }
                       }
                       if(campaignInvitees !== undefined){
                            for(let email in campaignInvitees){
                                $scope.campaignInvitees.push({email: email, status: inviterInformation[email].status, dateAdded: inviterInformation[email].dateAdded})
                            }
                       }
                       if(successAndInsurancePolicy === undefined){
                           $scope.successAndInsurancePolicyGuard()
                       }
                       if(pickSixComplete != undefined && pickSixComplete === true){
                           $scope.openCompleteSubmit()
                       }
                       
                    }
                )
                .catch( 
                    (err) => { 
                        console.error(err)
                    }
                )
        }
    )  
    .catch( 
        (error) => { console.error(error)}
    )
    
    $scope.sendEmails = function(emails){
        let sendObj = emails; 
        sendObj[`campaign_id`] = $routeParams.campaign_id
        sendObj[`campaign_name`] = $scope.campaign_pathname
        $scope.loading = 'Saving Participants'; 

        if($scope.loading === 'Saving Participants')
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
                        $scope.loading = false;
                        $scope.inviteesTables = [];
                        $scope.campaignInvitees = [];
                        const invited = invitationResponse.data.info.invitedFundraisers;
                        const campaignInvitees = invitationResponse.data.first_time;
                        for(let email in invited ){
                            if(email.startsWith(`${$routeParams.campaign_id}_`))
                            {
                                
                                const campaignEmail = email.split("_")[1];
                                $scope.campaignInvitees.push({email: campaignEmail, status: invited[email].status, dateAdded: invited[email].dateAdded })
                                $scope.campaignInviteesLen += 1;
                            }
                            else{
                                $scope.inviteesTables.push({email: email, status: invited[email].status, dateAdded: invited[email].dateAdded })
                            }
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
    $scope.removeFromInviteesTable = function(idx, uid){
        $scope.loading = 'loading';
        let objCopy = {}
        const arrCopy = [...$scope.inviteesTables]
        arrCopy.splice(idx, 1);
        for(let email of arrCopy){
            if(objCopy[email.email] === undefined)
            {
                objCopy[email.email] = email;
            }
        }
        return UserService.updateInvitees(objCopy, uid).then(
            (invitees) => {
                $scope.inviteesTables = []
                const invitedFundraisers = invitees.data.emails
                for(let email in invitedFundraisers)
                {
                    if(email.startsWith(`${$routeParams.campaign_id}_`)){
                        const campaignEmail = email.split("_")[1]
                        $scope.campaignInvitees.push({email: campaignEmail, status: invitedFundraisers[email].status, dateAdded: invitedFundraisers[email].dateAdded })
                    }
                    else{
                        $scope.inviteesTables.push({email: email, status: invitedFundraisers[email].status, dateAdded: invitedFundraisers[email].dateAdded })
                    }
                }
                $scope.loading = false
            }
        )
    }
    $scope.successAndInsurancePolicyGuard = function(){
        $('#completeSuccessWorkshop.ui.modal').modal('show')
    }
    $scope.openPickSixModal = function(){
        $('#pickSixModal.ui.modal').modal('show')
    }
    $scope.closePickSixModal = function(){
        $('#pickSixModal.ui.modal').modal('hide')
    }
    $scope.openCompleteSubmit = function(){
        $('#completeSubmit.ui.modal').modal('show')  
    }
    $scope.closeCompleteSubmit = function(){
        $('#completeSubmit.ui.modal').modal('hide')  
    }
})