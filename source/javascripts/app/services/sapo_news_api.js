mediavizServices.factory('SAPONews', function($http) {
  var baseUrl = "http://services.sapo.pt/InformationRetrieval/Epicentro/GetTrendline"
  var factory = {};
  factory.get = function(options) {
    return $http.get(baseUrl, {params: options, cache: false}).then(function(response) {
      return response;
    });
  }
  return factory;
});