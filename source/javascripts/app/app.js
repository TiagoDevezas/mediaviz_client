'use strict';

var mediavizApp = angular.module('mediavizApp', [
	'ngRoute',
	'ngResource',
	'ngAnimate',
	'ngSanitize',
	'ngAria',
	'ngMaterial',
	'ui.select',
	'pickadate',
	'mdDateTime',

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

mediavizApp.config(['$mdThemingProvider', '$routeProvider', 'uiSelectConfig', '$locationProvider',
	function($mdThemingProvider, $routeProvider, uiSelectConfig, $locationProvider) {

		$mdThemingProvider.theme('default')
			.primaryPalette('cyan')
			.accentPalette('red');

		$routeProvider.when('/', {
			templateUrl: 'partials/app/home.html',
			controller: 'HomeCtrl'
		}).
		when('/source/:name', {
			templateUrl: 'partials/app/source.html',
			controller: 'SourceCtrl'
		}).
		when('/sources', {
			templateUrl: 'partials/app/sources.html',
			controller: 'SourcesCtrl',
			reloadOnSearch: false
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
		when('/coverage', {
			templateUrl: 'partials/app/coverage.html',
			controller: 'CoverageCtrl',
			reloadOnSearch: false
		}).
		when('/chronicle', {
			templateUrl: 'partials/app/chronicle.html',
			controller: 'ChronicleCtrl',
			reloadOnSearch: false
		}).
		when('/stacks', {
			templateUrl: 'partials/app/stacks.html',
			controller: 'StacksCtrl',
			reloadOnSearch: false
		}).
		when('/articles', {
			templateUrl: 'partials/app/articles.html',
			controller: 'ArticlesCtrl',
			reloadOnSearch: false
		}).
		when('/photofinish', {
			templateUrl: 'partials/app/photofinish.html',
			controller: 'PhotoFinishCtrl',
			reloadOnSearch: false
		}).
		otherwise({
			redirectTo: '/'
		});

		//$locationProvider.html5Mode(true);

	  uiSelectConfig.theme = 'select2';

	}]);