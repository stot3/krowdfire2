app.service('OktaService', () => {
  const okta = {};
  
  okta.redirect = () => {
    const hash = window.location.hash.substr(1, window.location.hash.length-1);
    const params = new URLSearchParams(hash);
    const state = params.get('state')
    if(state){
      window.location.href = `${state}#${params.toString()}`
    }
  }
  return okta
})