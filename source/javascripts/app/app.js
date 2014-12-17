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
			templateUrl: 'partials/app/about.html'
		}).
		when('/flow', {
			templateUrl: 'partials/app/flow.html',
			controller: 'FlowCtrl'
		}).
		when('/compare', {
			templateUrl: 'partials/app/compare.html',
			controller: 'CompareCtrl'
		}).
		when('/chronicle', {
			templateUrl: 'partials/app/chronicle.html',
			controller: 'ChronicleCtrl',
			reloadOnSearch: false
		}).
		when('/chronicle/items', {
			templateUrl: 'partials/app/chronicle-items.html',
			controller: 'ChronicleItemsCtrl'
		}).
		when('/dashboard', {
			templateUrl: 'partials/app/main.html',
			controller: 'MainCtrl'
		}).
		when('/:source', {
			templateUrl: 'partials/app/main.html',
			controller: 'SourceCtrl'
		}).
		otherwise({
			redirectTo: '/'
		});

		//$locationProvider.html5Mode(true);

	  uiSelectConfig.theme = 'select2';

	}]);