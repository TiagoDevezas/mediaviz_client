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

mediavizApp.config(['$routeProvider', 'uiSelectConfig',
	function($routeProvider, uiSelectConfig) {
		$routeProvider.when('/', {
			templateUrl: 'partials/app/main.html',
			controller: 'MainCtrl'
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
		when('/:source', {
			templateUrl: 'partials/app/main.html',
			controller: 'SourceCtrl'
		}).
		otherwise({
			redirectTo: '/'
		});

	  uiSelectConfig.theme = 'select2';
	}]);