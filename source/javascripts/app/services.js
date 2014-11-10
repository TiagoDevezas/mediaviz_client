'use strict';

var mediavizServices = angular.module('mediavizServices', ['ngResource']);

mediavizServices.factory('Source', ['$resource',
	function($resource) {
		return $resource('http://mediaviz.fe.up.pt:3000/api/sources', {},
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