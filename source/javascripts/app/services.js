'use strict';

var mediavizServices = angular.module('mediavizServices', ['ngResource']);

var baseUrl = 'http://mediaviz.fe.up.pt:3000/api/';

var jsonp = { 
				options: {
						method: 'JSONP',
						isArray: true, 
						params: {
							callback: 'JSON_CALLBACK',
							resource: '@resource'
						}
					}
				};

mediavizServices.factory('SourceList', ['$http',
	function($http) {
		var callback = '?callback=JSON_CALLBACK';
		return {
			get: function(myCallback) {
				return $http.jsonp(baseUrl + 'sources' + callback)
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

mediavizServices.factory('Resources', ['$resource',
	function($resource) {
		return $resource(baseUrl + ':resource', {},
		{
			get: jsonp.options	
		});
	}]);

mediavizServices.factory('Chart', function() {
	return {
		draw: function(params) {
			return c3.generate(params.options);
		}
	}
});

mediavizServices.factory('DataFormatter', function() {

	return {
		inColumns: function formatData(data, IdKey) {
			var columns = [];
			var timeCol = [];
			var valueCol = [];
			angular.forEach(data, function(datum) {
				timeCol.push(datum.time);
				valueCol.push(datum.articles);
			});
			timeCol.unshift('timeFor' + IdKey);
			valueCol.unshift(IdKey);
			columns.push(timeCol, valueCol);
			return columns;
		}
	}
});


// mediavizServices.factory('Sources', ['$resource',
// 	function($resource) {
// 		return $resource(baseUrl + 'sources', {},
// 		{
// 			get: jsonp.options 
		
// 		});
// 	}]);

// mediavizServices.factory('Feeds', ['$resource',
// 	function($resource) {
// 		return $resource(baseUrl + 'feeds', {},
// 		{
// 			get: jsonp.options
// 		});
// 	}]);

// mediavizServices.factory('Items', ['$resource',
// 	function($resource) {
// 		return $resource(baseUrl + 'items', {},
// 		{
// 			get: jsonp.options
// 		});
// 	}]);

// mediavizServices.factory('Totals', ['$resource',
// 	function($resource) {
// 		return $resource(baseUrl + 'totals', {},
// 		{
// 			get: jsonp.options
// 		});
// 	}]);