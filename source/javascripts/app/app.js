'use strict';

var mediavizApp = angular.module('mediavizApp', [
	'ngRoute',
	'ngResource',
	'ui.select',

	'mediavizControllers',
	'mediavizServices'
]);

// mediavizApp.config(function(uiSelectConfig) {
//   uiSelectConfig.theme = 'select2';
//   uiSelectConfig.resetSearchInput = true;
// });

mediavizApp.config(['$routeProvider', 'uiSelectConfig', '$locationProvider',
	function($routeProvider, uiSelectConfig, $locationProvider) {

		$routeProvider.when('/', {
			templateUrl: 'partials/app/home.html',
			controller: 'HomeCtrl'
		}).
		when('/about', {
			templateUrl: 'partials/app/about.html'
		}).
		when('/flow', {
			templateUrl: 'partials/app/flow.html',
			controller: 'FlowCtrl'
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