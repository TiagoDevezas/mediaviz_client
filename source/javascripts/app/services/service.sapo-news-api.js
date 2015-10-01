mediavizServices.factory('SAPONews', function($http, $rootScope) {
  var baseUrl = "http://services.sapo.pt/InformationRetrieval/Epicentro/GetTrendline";
  var factory = {};
  factory.get = function(options) {
    return $http.get(baseUrl, {params: options, cache: false}).then(function(response) {
      return response;
    }, function(reason) {
    	if($rootScope.loading) {
    		!$rootScope.loading;
    	}
    	console.log("SAPONews service error", reason);
    });
  }
  return factory;
});