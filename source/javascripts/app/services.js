'use strict';

var mediavizServices = angular.module('mediavizServices', ['ngResource']);

mediavizServices
	.factory('Source', ['$resource',
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