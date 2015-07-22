'use strict';

var mediavizApp = angular.module('mediavizApp', [
	'ngRoute',
	'ngResource',
	'ngAnimate',
	'ngSanitize',
	'ngAria',
	'ngMaterial',
	'mdPickers',
	// 'ui.select',
	// 'pickadate',
	// 'mdDateTime',

	'mediavizControllers',
	'mediavizServices',
	'mediavizDirectives',
	'mediavizFilters'
]);

var mediavizControllers = angular.module('mediavizControllers', []);
var mediavizServices = angular.module('mediavizServices', []);
var mediavizDirectives = angular.module('mediavizDirectives', []);
var mediavizFilters = angular.module('mediavizFilters', []);

mediavizApp.run(function($rootScope, $location, $window) {
  $rootScope.$on('$locationChangeSuccess',
    function(event) {
      if (!$window.ga) {
        return;
      }
      $window.ga('send', 'pageview', {
        page: $location.url()
      });
    });
});

mediavizApp.config(['$mdThemingProvider', '$routeProvider', '$locationProvider',
	function($mdThemingProvider, $routeProvider, uiSelectConfig, $locationProvider) {

		$mdThemingProvider.theme('default')
			.primaryPalette('cyan')
			.accentPalette('red');

		$mdThemingProvider.theme('sapoTheme')
			.primaryPalette('green')
			.accentPalette('yellow');

		$routeProvider.when('/', {
			templateUrl: 'partials/app/home.html',
			controller: 'HomeCtrl'
		}).
		when('/SAPO', {
			templateUrl: 'partials/app/sapo.html',
			controller: 'SAPOCtrl',
			caseInsensitiveMatch: true
		}).
		when('/SAPO/fontes', {
			templateUrl: 'partials/app/sources.html',
			controller: 'SourcesCtrl',
			caseInsensitiveMatch: true,
			reloadOnSearch: false
		}).
		when('/SAPO/cronica', {
			templateUrl: 'partials/app/keywords.html',
			controller: 'KeywordsCtrl',
			caseInsensitiveMatch: true,
			reloadOnSearch: false
		}).
		when('/SAPO/newsmap', {
			templateUrl: 'partials/app/newsmap.html',
			controller: 'NewsMapCtrl',
			reloadOnSearch: false
		}).
		when('/chronicle', {
			templateUrl: 'partials/app/keywords.html',
			controller: 'KeywordsCtrl',
			reloadOnSearch: false
		}).
		when('/newsmap', {
			templateUrl: 'partials/app/newsmap.html',
			controller: 'NewsMapCtrl',
			reloadOnSearch: false
		}).
		otherwise({
			redirectTo: '/'
		});

	  // uiSelectConfig.theme = 'select2';

	}]);