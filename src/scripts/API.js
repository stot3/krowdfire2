app.provider('APIAuth', function(API_URL) { // Map authentication calls to API
	this.$get = ['$resource', function($resource) {
		var Auth = $resource(API_URL.url + API_URL.loc + ':service/:action/:email', {service: '@service', action: '@action'},   { 
			'login':  {method:'POST', isArray: false, params: {service: 'authenticate'}},
			'getaccount': {method:'GET', isArray: false, params: {service: 'account', action: 'email'}}
			// 'get':    {method:'GET'},				// Angular defaults
			// 'save':   {method:'POST'},				// Angular defaults
			// 'query':  {method:'GET', isArray:true},	// Angular defaults			
			// 'remove': {method:'DELETE'},				// Angular defaults	
			// 'delete': {method:'DELETE'}				// Angular defaults
		});
		return Auth;
	}];
});

app.provider('APIRegister', function(API_URL) { // Map registration calls to API
	this.$get = ['$resource', function($resource) {
		var Reg = $resource(API_URL.url + API_URL.loc + ':service/:action/', {service: '@service', action: '@action'},   { 
			'regconfirm':  {method:'POST', isArray: false, params: {service: 'register', action: 'confirm'}},
			'reg':  {method:'POST', isArray: false, params: {service: 'register'}}
			// 'getaccount': {method:'GET', isArray: false, params: {service: 'account', action: 'email'}}
		});
		return Reg;
	}];
});

app.provider('APICampaign', function(API_URL) { // Map campaign calls to API
	this.$get = ['$resource', function($resource) {
		var Campaign = $resource(API_URL.url + API_URL.loc + ':service/:campaign_id', {service: '@service'},   { 
			'create':  {method:'POST', isArray: false, params: {service: 'campaign'}},
			'update':  {method:'PUT', isArray: false, params: {service: 'campaign', campaign_id: '@campaign_id'}}
			// 'getaccount': {method:'GET', isArray: false, params: {service: 'account', action: 'email'}}
		});
		return Campaign;
	}];
});

app.provider('APIPortal', function(API_URL) { // Map portal calls to API
	this.$get = ['$resource', function($resource) {
		var Portal = $resource(API_URL.url + API_URL.loc + ':portal/:item', {portal: '@portal', item: '@item'}, {
			'categories': {method: 'GET', isArray: true, params: {portal: 'portal', item: 'category'}}
		});
		return Portal;
	}];
});

app.provider('APILocale', function(API_URL) { // Map locale calls to API
	this.$get = ['$resource', function($resource) {
		var Locale = $resource(API_URL.url + API_URL.loc + ':locale/:item', {locale: '@locale', item: '@item'}, {
			'currencies': {method: 'GET', isArray: true, params: {locale: 'locale', item: 'currency'}},
			'countries': {method: 'GET', isArray: true, params: {locale: 'locale', item: 'country'}}
		});
		return Locale;
	}];
});