app.service("CreatorInviteService", function($http){
    var emailer = {}
    emailer.sendEmails = function(emails){
        return $http.post("https://us-central1-sistrunk-software.cloudfunctions.net/activateAlgorithm", JSON.stringify(emails), {
            headers: {
                "Content-Type" : "application/json"
            }
        })
    }
    return emailer
})