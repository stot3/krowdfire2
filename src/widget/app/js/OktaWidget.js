
window.oktaWidget = null;
window.onmessage = async function(e){
  if (e.data.type !== undefined && e.data.type === 'idToken') {
    const id_token = e.data.value;
    let loginComponent = window['loginComponentRef'].component;
    const res = await window['loginComponentRef'].zone.run(() => { window.loginComponentRef.component.oktaSocialLogin(id_token) }).catch((e) => {
      console.error("First stage social validation fail: ", e)
    });
    console.log(e.data.value, {res})
  }else if (e.data.type !== undefined && e.data.type === 'oktaNonSocialLogin'){
    const {email = "", password = ""} = e.data.value;
    const scope = window['loginComponentRef'].component;
      try {
        console.log("Attempting submit")
        const res = await window['loginComponentRef'].zone.run(() => { window.loginComponentRef.component.oktaLoginWrapper(email, password) }).catch((e) => {
          console.error("First stage validation fail: ", e)
        });
        console.log("Finished first stage submit")
        console.log({newRes: res})
        if (res !== undefined && res.authenticated === 0) {
          console.log("Internal user not found. Attempting Okta endpoint")
          const okta_result = await angular.element($('#widget-container')).scope().oktaValidate();
          if (okta_result.authenticated !== undefined && okta_result.authenticated !== 1) {
            throw { error: "Authentication through Okta backend endpoint failed", okta_result };
          }
          console.log({okta_result})
        }
      } catch (e) {
        console.error(e)
      }
  }else if (e.data.type !== undefined && e.data.type === 'setIFrameHeight' && isNaN(e.data.value) === false){
    console.log("attempting to set height: ", e.data.value)
    $("#okta-iframe").height(e.data.value);
  }
};
window.oktaInit = async function(){
    function createOktaIFrame(config){
      var iframe = document.createElement('iframe');
      var extraIdpHeight = 0;
      if (config.idps.length > 0) {
        extraIdpHeight = 5 + 4.5 * config.idps.length;
      } 
      var html = `
      <head>
        <script src="https://global.oktacdn.com/okta-signin-widget/5.3.3/js/okta-sign-in.min.js" type="text/javascript"></script>
        <link href="https://global.oktacdn.com/okta-signin-widget/5.3.3/css/okta-sign-in.min.css" type="text/css" rel="stylesheet"/>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
        <style>
          #okta-sign-in {
            margin-top: 0px !important;
            border: none !important;
            max-width: 100% !important;
            width: unset !important;
          }
          .okta-sign-in-header, .okta-form-title {
            display: none !important;
          }
          #okta-sign-in .auth-content {
            padding: 0px 5px 0px 5px !important;
          }
          #okta-sign-in .auth-footer {
            display: none;
          }
          #okta-sign-in .social-auth-button.link-button {
            font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif !important;
            padding-left: 0px !important;
            text-align: center !important;
          }
        </style>
      </head>
      <body>
        <div id="widget-container">
        <script>
          let config = ${JSON.stringify(config)};
          let oktaWidget = new OktaSignIn(config);
          oktaWidget.renderEl({ el: "#widget-container" }, function success(res){ 
            if (res.status === 'SUCCESS') {
              const accessToken = res.tokens.accessToken.value;
              const idToken = res.tokens.idToken.value;
              console.log({accessToken, idToken})
              window.parent.postMessage({type: 'idToken', value: idToken}, '*')
              // console.log("iFrame client height: ", document.body.height)
            }else {
              console.error("Okta IFrame Fail");
            }
          });
          async function oktaFormSubmit(){
            const scope = window.parent['loginComponentRef'].component;
            try {
              const email = $('#okta-signin-username').val();
              const password = $('#okta-signin-password').val();
              console.log("Attempting submit postMessage")

              window.parent.postMessage({type: 'oktaNonSocialLogin', value: {email, password}}, '*')
              console.log("end of okta form submit")
            } catch (e) {
              console.error(e) 
            }
          }
          oktaWidget.on('ready', function (context) {
            let height = $('#widget-container').height() + 5;
            console.log('height of widget container in iframe: ', height);
            window.parent.postMessage({type: 'setIFrameHeight', value: height}, '*')
            console.log("Okta widget ready iframe");
            $("#okta-signin-submit").attr("type", "button");
            $("#okta-signin-submit").click(oktaFormSubmit);
            $('#okta-signin-username').keyup(function(event) {
              if (event.which === 13) {
                event.preventDefault();
                oktaFormSubmit();
              }
            });
            $('#okta-signin-password').keyup(function(event) {
              if (event.which === 13) {
                event.preventDefault();
                oktaFormSubmit();
              }
            });
          });
        </script>
        </div>
      </body>`;
      iframe.srcdoc = html;
      iframe.style.cssText = `border:0;display:block;height:${27 + extraIdpHeight}vh;`
      iframe.scrolling = "no";
      iframe.width = '100%';
      iframe.id = "okta-iframe"
      document.getElementById("widget-container-iframe").appendChild(iframe);
    }
    let loginComponent = window['loginComponentRef'];
    console.log({scope: loginComponent})
    loginComponent = window['loginComponentRef'].component;
    const settings = loginComponent.socialLoginSettings;

    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
    const webuiUrl = baseUrl + 'login';
    
    const redirectUrl = baseUrl; //window.location.href;

    const oktaBaseConfig = {
      idps: [],
      idpDisplay: "SECONDARY",
      helpLinks: {
        forgotPassword: `javascript:window.open("${webuiUrl}")`
      },
      authParams: {
        pkce: false,
      },
      redirectUri: redirectUrl
    }
    var config = oktaBaseConfig;
    config.baseUrl = settings.okta_domain;
    config.clientId = settings.okta_clientId;
    config.customButtons = [];
    if (window["OktaConfig"] !== undefined) {
      if (window["OktaConfig"].language !== undefined) {
        config.language = window["OktaConfig"].language
      }
      if (window["OktaConfig"].i18n !== undefined) {
        config.i18n = window["OktaConfig"].i18n
      }
    }
    if (settings.providers){
      for(const [provider, {toggle, idpId}] of Object.entries(settings.providers)){
        console.log({toggle, provider, idpId})
        if (toggle === true){
          config.idps.push({type: provider.toUpperCase(), id: idpId})
        }
      }
    }
    console.log({config})
    console.log({settings})
    if (window.oktaWidget !== null){
      console.log("Removing okta widget")
      window.oktaWidget.remove()
    }
    window.oktaWidget = await new OktaSignIn(config);
    createOktaIFrame(config)
}