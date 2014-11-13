'use strict';

var mediavizServices = angular.module('mediavizServices', ['ngResource']);

mediavizServices.factory('SourceList', ['$http',
	function($http) {
		var baseUrl = 'http://mediaviz.fe.up.pt:3000/';
		var callback = '?callback=JSON_CALLBACK';
		return {
			get: function(myCallback) {
				return $http.jsonp(baseUrl + 'api/sources' + callback)
				.success(function(response) {
					var sources = response.map(function(el) {
						return { 'name': el.name, 'type': el.type };
					});
					sources.unshift({'name': 'Todas', 'type': ''});
					var sourceArray = sources;
					myCallback(sources);						
				});			
			}
		};
	}]);


mediavizServices.factory('Sources', ['$resource',
	function($resource) {
		var baseUrl = 'http://mediaviz.fe.up.pt:3000/'
		return $resource(baseUrl + 'api/sources', {},
		{
			get: { 
				method: 'JSONP',
				isArray: true, 
				params: {
					callback: 'JSON_CALLBACK'
				} 
			}
		});
	}]);

mediavizServices.factory('Feeds', ['$resource',
	function($resource) {
		var baseUrl = 'http://mediaviz.fe.up.pt:3000/'
		return $resource(baseUrl + 'api/feeds', {},
		{
			get: { 
				method: 'JSONP',
				isArray: true, 
				params: {
					callback: 'JSON_CALLBACK'
				} 
			}
		});
	}]);

mediavizServices.factory('Items', ['$resource',
	function($resource) {
		var baseUrl = 'http://mediaviz.fe.up.pt:3000/'
		return $resource(baseUrl + 'api/items', {},
		{
			get: { 
				method: 'JSONP',
				isArray: true, 
				params: {
					callback: 'JSON_CALLBACK'
				} 
			}
		});
	}]);

mediavizServices.factory('Totals', ['$resource',
	function($resource) {
		var baseUrl = 'http://mediaviz.fe.up.pt:3000/'
		return $resource(baseUrl + 'api/totals', {},
		{
			get: { 
				method: 'JSONP',
				isArray: true, 
				params: {
					callback: 'JSON_CALLBACK'
				} 
			}
		});
	}]);

mediavizServices.factory('Chart', function() {
	return {
		draw: function(params) {
			return c3.generate(params.options);
		}
	}
});