app.config(function($translateProvider, $translatePartialLoaderProvider, LANG) {
	$translateProvider.useLoader('$translatePartialLoader', {
		urlTemplate: 'views/translation/{lang}/{part}.json'
	});
	$translateProvider.preferredLanguage(LANG.PREFERRED_LANG);
	$translateProvider.fallbackLanguage(LANG.DEFAULT_LANG);

});
