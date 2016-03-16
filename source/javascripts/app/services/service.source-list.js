mediavizServices.factory('SourceList', ['$http',
	function($http) {
		var baseUrl = 'http://irlab.fe.up.pt/p/newsir_api/';
		var callback = '?callback=JSON_CALLBACK';
		var factory = {};
		factory.getDefaultList = function() {
			return $http.get(baseUrl + 'sources?type=all', {cache: true}).then(function(response) {
				var sources = response.data.map(function(el) {
					return { 'name': el.type, 'type': el.type, 'acronym': el.type };
				});
				return sources;
			});
		}

		return factory;
	}]);