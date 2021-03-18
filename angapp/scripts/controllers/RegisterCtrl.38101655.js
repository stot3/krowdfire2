app.controller("RegisterCtrl",["$scope","$rootScope","$location","Restangular","PortalSettingsService","UserService","$translate","$translatePartialLoader",function($scope,$rootScope,$location,Restangular,PortalSettingsService,UserService,$translate,$translatePartialLoader){$scope.tos_register=!1,$scope.submit_once=!1,$scope.organization_name={},PortalSettingsService.getSettings(!0).then((function(success){$scope.public_settings={},angular.forEach(success,(function(value){3==value.setting_type_id&&($scope.public_settings[value.name]=value.value)})),$scope.val=success,$rootScope.registerRedirect=null,angular.forEach($scope.val,(function(value){value&&("site_tos_registration_ui"===value.name&&($scope.tos_register=value.value),"site_auto_approve_new_users"==value.name?$scope.showMess=value.value:"site_register_redirect"!==value.name||$rootScope.registerRedirect?"site_auth_scheme"===value.name&&($scope.auth_scheme_id=value.value.id):($rootScope.registerRedirect=value.value,void 0!==$scope.registerRedirect.text&&""!==$scope.registerRedirect.text&&void 0!==$scope.registerRedirect.link&&""!==$scope.registerRedirect.link?$scope.registerRedirectShow=!0:$scope.registerRedirectShow=!1))})),$scope.getCustomFields()})),$scope.getCustomFields=function(){$scope.custom_field=[],$scope.public_settings.site_campaign_personal_section_custom&&$scope.public_settings.site_campaign_personal_section_custom.length>0&&($scope.pcustom=[],angular.forEach($scope.public_settings.site_campaign_personal_section_custom,(function(value,key){var fieldRequire=!1,fieldPlaceholder="";value.placeholder&&(fieldPlaceholder=value.placeholder),value.profile_setting_required&&(fieldRequire=value.profile_setting_required);var field={name:value.name,identifier:"customField"+key,value:"",option:value.option,dropdown_array:value.dropdown_array,profile_step_show:value.profile_step_show,profile_setting_register_show:value.profile_setting_register_show,profile_setting_show:value.profile_setting_show,register_show:value.register_show,validate:value.validate,placeholder:fieldPlaceholder,required:fieldRequire};$scope.pcustom.push(field)})),$scope.pcustom_copy=angular.copy($scope.pcustom))},$scope.customFieldDropdown=function(options,field){field.value=options},$.fn.form.settings.rules.regexCustomValidation=function(value,validate){var regex=new RegExp(validate);return!value||!!regex&&regex.test(value)},setTimeout((function(){$translate(["login_page_first_name_empty","login_page_organization_name_empty","login_page_ein_empty","login_page_last_name_empty","login_page_empty_email","login_page_valid_email","login_page_password_empty","login_page_password_length","login_page_reenter_password","login_page_password_match","register_custom_field_validate","register_custom_field_empty"]).then((function(value){$scope.first_name_empty=value.login_page_first_name_empty,$scope.last_name_empty=value.login_page_last_name_empty,$scope.email_empty=value.login_page_empty_email,$scope.email_valid=value.login_page_valid_email,$scope.password_empty=value.login_page_password_empty,$scope.password_length=value.login_page_password_length,$scope.reenter_password=value.login_page_reenter_password,$scope.password_match=value.login_page_password_match,$scope.organization_empty=value.login_page_organization_name_empty,$scope.ein_empty=value.login_page_ein_empty,$scope.custom_field_validate=value.register_custom_field_validate,$scope.custom_field_empty=value.register_custom_field_empty,$scope.form_validation={firstName:{identifier:"first_name",rules:[{type:"empty",prompt:$scope.first_name_empty}]},lastName:{identifier:"last_name",rules:[{type:"empty",prompt:$scope.last_name_empty}]},email:{identifier:"email",rules:[{type:"empty",prompt:$scope.email_empty},{type:"email",prompt:$scope.email_valid}]},password:{identifier:"password",rules:[{type:"empty",prompt:$scope.password_empty},{type:"length[6]",prompt:$scope.password_length}]},passwordMatch:{identifier:"password_confirm",rules:[{type:"empty",prompt:$scope.reenter_password},{type:"match[password]",prompt:$scope.password_match}]},organizationName:{identifier:"organization_name",rules:[{type:"empty",prompt:$scope.organization_empty}]},einNumber:{identifier:"ein",rules:[{type:"empty",prompt:$scope.ein_empty}]}},$scope.public_settings.site_campaign_personal_section_custom&&$scope.pcustom&&$scope.public_settings.site_campaign_personal_section_custom.length>0&&angular.forEach($scope.pcustom,(function(value,key){if(value.required&&!value.validate){var customValidate={identifier:value.identifier,rules:[{type:"empty",prompt:$scope.custom_field_empty}]};$scope.form_validation["customField"+key]=customValidate}else if(!value.required&&value.validate){customValidate={identifier:value.identifier,rules:[{type:"regexCustomValidation["+value.validate+"]",prompt:$scope.custom_field_validate}]};$scope.form_validation["customField"+key]=customValidate}else if(value.required&&value.validate){customValidate={identifier:value.identifier,rules:[{type:"empty",prompt:$scope.custom_field_empty},{type:"regexCustomValidation["+value.validate+"]",prompt:$scope.custom_field_validate}]};$scope.form_validation["customField"+key]=customValidate}})),$(".ui.register.form").form($scope.form_validation,{inline:!0})}))}),1e3),$scope.formData={},$scope.submit=function(){if($scope.userData={email:$scope.formData.email,password:$scope.formData.password},$scope.tos_register){if($scope.submit_once=!0,!$('#register input[type="checkbox"]').is(":checked"))return void($scope.register_tos_not_checked=!0);$scope.register_tos_not_checked=!1}if(!!$(".ui.register.form").form("validate form")){$scope.formData.errors=null,$scope.formData.successful=null,$scope.loading=!0,$scope.formData.successful={message:"register_processing_registration"},$translate("login_page_processing_registration").then((function(value){$scope.registration_processing=value}));var auth_scheme="";switch($scope.auth_scheme_id){case 1:auth_scheme="crypt-bf8";break;case 2:auth_scheme="sha1";for(var secret_key="",possible="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",i=0;i<30;i++)secret_key+=possible.charAt(Math.floor(Math.random()*possible.length));var password_scheme_options='{"sha1":{"secret_key":"'+secret_key+'"}}';break;default:auth_scheme=""}void 0!==password_scheme_options&&($scope.formData.password_scheme_options=password_scheme_options),$scope.formData.password_scheme=auth_scheme;var custom_fields={};$scope.pcustom&&angular.forEach($scope.pcustom,(function(v){custom_fields[v.name]=v.value})),$scope.public_settings.site_campaign_enable_organization_name&&(custom_fields.organization_name=$scope.organization_name.value,custom_fields.ein=$scope.organization_name.ein),custom_fields&&($scope.formData.attributes=JSON.stringify(custom_fields)),Restangular.one("register").customPOST($scope.formData).then((function(success){if($scope.showMess?($rootScope.userEmail=$scope.formData.email,$scope.formData="",$scope.formData={},$scope.formData.successful={message:"register_success_account_confirmed"},$scope.agreed=!1,$translate("account_confirmed").then((function(value){$scope.registration_processing=value}))):($scope.formData.successful={message:"register_confirmation_email_sent"},$translate("login_page_confirmation_sent").then((function(value){$scope.registration_processing=value}))),$scope.public_settings.site_auto_approve_new_users)return Restangular.all("authenticate").post($scope.userData).then((function(logInData){UserService.setLoggedIn(logInData,!0),$location.path("/"),UserService.isLoggedIn()&&Restangular.one("portal/person/attribute",UserService.person_id).customPUT(data)})),void($scope.loading=!1);$scope.loading=!1}),(function(failure){$scope.formData.errors=failure.data.errors,$scope.formData.successful=null,$scope.errcode=$scope.formData.errors.email[0].code,$scope.loading=!1,"register_invalid_email_exists"===$scope.errcode&&$translate("login_page_email_alreadyused").then((function(value){$scope.error_messgae=value})),"register_transaction_account_create"===$scope.errcode&&$translate("login_page_account_creation_failed").then((function(value){$scope.error_messgae=value}))}))}}}]),app.controller("RegConfirmCtrl",["$routeParams","$scope","$route","UserService","APIRegister","ipCookie","Restangular","$translate",function($routeParams,$scope,$route,UserService,APIRegister,ipCookie,Restangular,$translate){$scope.confirmation={},$routeParams.validation_token&&(UserService.isLoggedIn()&&(ipCookie.remove("current.user"),Restangular.one("logout").customPOST()),APIRegister.regconfirm({token:$routeParams.validation_token},(function(success){$scope.confirmation.confirmed={message:"register_success_account_confirmed"},setTimeout((function(){$translate("account_confirmed").then((function(value){$scope.account_confirmed=value}))}),1e3),$scope.confirmation.errors=null,$('#login input[name="email"]').val(success.email)}),(function(failure){$scope.confirmation.confirmed=!1,$scope.confirmation.errors=failure.data.errors,setTimeout((function(){$translate("token_invalid").then((function(value){$scope.token_invalid=value}))}),1e3)})))}]);