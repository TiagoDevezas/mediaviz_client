'use strict';

var mediavizApp = angular.module('mediavizApp', [
	'ngRoute',
	'ngResource',

	'mediavizControllers',
	'mediavizServices'
]);

mediavizApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.when('/', {
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
	}]);