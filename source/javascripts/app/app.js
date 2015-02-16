'use strict';

var mediavizApp = angular.module('mediavizApp', [
	'ngRoute',
	'ngResource',
	'ngAnimate',
	'ngSanitize',
	'ui.select',
	'pickadate',

	'mediavizControllers',
	'mediavizServices',
	'mediavizDirectives'
]);

mediavizApp.run(function($rootScope, $location, $window) {
  $rootScope.$on('$routeChangeSuccess',
    function(event) {
      if (!$window.ga) {
        return;
      }
      $window.ga('send', 'pageview', {
        page: $location.path().search(search)
      });
    });
});

mediavizApp.config(['$routeProvider', 'uiSelectConfig', '$locationProvider',
	function($routeProvider, uiSelectConfig, $locationProvider) {

		$routeProvider.when('/', {
			templateUrl: 'partials/app/home.html',
			controller: 'HomeCtrl'
		}).
		when('/source/:name', {
			templateUrl: 'partials/app/source.html',
			controller: 'SourceCtrl'
		}).
		when('/about', {
			templateUrl: 'partials/app/about.html',
			controller: 'AboutCtrl'
		}).
		when('/flow', {
			templateUrl: 'partials/app/flow.html',
			controller: 'FlowCtrl',
			reloadOnSearch: false
		}).
		when('/compare', {
			templateUrl: 'partials/app/compare.html',
			controller: 'CompareCtrl',
			reloadOnSearch: false
		}).
		when('/social', {
			templateUrl: 'partials/app/social.html',
			controller: 'SocialCtrl',
			reloadOnSearch: false
		}).
		when('/chronicle', {
			templateUrl: 'partials/app/chronicle.html',
			controller: 'ChronicleCtrl',
			reloadOnSearch: false
		}).
		when('/articles', {
			templateUrl: 'partials/app/articles.html',
			controller: 'ArticlesCtrl',
			reloadOnSearch: false
		}).
		when('/dashboard', {
			templateUrl: 'partials/app/main.html',
			controller: 'MainCtrl'
		}).
		// when('/:source', {
		// 	templateUrl: 'partials/app/main.html',
		// 	controller: 'SourceCtrl'
		// }).
		otherwise({
			redirectTo: '/'
		});

		//$locationProvider.html5Mode(true);

	  uiSelectConfig.theme = 'select2';

	}]);