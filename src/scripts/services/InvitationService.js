app.service('InvitationService', function($http){
    this.requestInvitation = function(email){

        var request = $http.post('https://us-central1-sistrunk-software.cloudfunctions.net/contactUsFormForKrowdFire', JSON.stringify({email: email}))
        return request
        .then( () => { 
            $('#requestModal.ui.modal')
            .modal('hide')
        }).catch( 
            (err) => { 
                console.log(err)
                return err
            }
        ) 
    }
})