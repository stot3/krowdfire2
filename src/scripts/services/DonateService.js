app.service('DonateService', function($http){
    function getPaidStatus(email){
        return $http.post('https://us-central1-sistrunk-software.cloudfunctions.net/getProfile', {email: email}, {headers: {"Content-Type": "application/json"}})
        .catch(
            (err) => { 
                console.error(err)
            }
        )
    }
    function setPaidStatus(email){
        return $http.post('https://us-central1-sistrunk-software.cloudfunctions.net/userPaid', {email: email}, {headers: {"Content-Type": "application/json"}}).catch(
            (err) => { 
                console.error(err)
            }
        )
    }
})