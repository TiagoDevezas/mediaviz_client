'use strict';

var mediavizServices = angular.module('mediavizServices', ['ngResource']);

var baseUrl3 = 'http://mediaviz.fe.up.pt/panorama/api/';

var baseUrl2 = 'panorama/api/';

var baseUrl = 'http://irlab.fe.up.pt/p/mediaviz/panorama/api/';

mediavizServices.factory('Page', function($rootScope) {
	var title = 'MediaViz';
	return {
		title: function() { $rootScope.pageTitle = title; },
		setTitle: function(newTitle) { $rootScope.pageTitle = title + ' || ' + newTitle }
	}
});

mediavizServices.factory('SourceList', ['$http',
	function($http) {
		var callback = '?callback=JSON_CALLBACK';
		return {
			get: function(myCallback) {
				return $http.jsonp(baseUrl + 'sources' + callback, {cache: true})
				.success(function(response) {
					var sources = response.map(function(el) {
						return { 'name': el.name, 'type': el.type, 'acronym': el.acronym };
					});
					sources.unshift({'name': 'All archive', 'type': 'archive', 'acronym': 'archive', 'group': true });
					sources.unshift({'name': 'All blogs', 'type': 'blogs', 'acronym': 'blogs', 'group': true });
					sources.unshift({'name': 'All international', 'type': 'international', 'acronym': 'international', 'group': true});
					sources.unshift({'name': 'All national', 'type': 'national', 'acronym': 'national', 'group': true });
					var sourceArray = sources;
					myCallback(sources);				
				});
			}
		};
	}]);

mediavizServices.factory('Resources', ['$resource', '$q',
	function($resource, $q) {
		//var canceller = $q.defer();
		var jsonp = { 
				options: {
						method: 'JSONP',
						isArray: true,
						// cache: true, 
						params: {
							callback: 'JSON_CALLBACK',
							resource: '@resource'
						}
					}
				};
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
		inColumns: function formatData(data, IdKey, key1, key2) {
			if(data.length > 0) {
				var columns = [];
				var timeCol = [];
				var valueCol = [];
				angular.forEach(data, function(datum) {
					timeCol.push(datum['' + key1 + '']);
					valueCol.push(datum['' + key2 + '']);
				});
				timeCol.unshift('timeFor' + IdKey);
				valueCol.unshift(IdKey);
				columns.push(timeCol, valueCol);
				return columns;
			} else {
				return [];
			}
		}
	}
});