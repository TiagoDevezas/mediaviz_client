mediavizServices.factory('SAPONews', function($http) {
  var baseUrl = "http://services.sapo.pt/InformationRetrieval/Epicentro/GetTrendline";
  var callback = '?callback=JSON_CALLBACK';
  var factory = {};
  factory.get = function(options) {
    return $http.jsonp(baseUrl + callback, {params: options, cache: false}).then(function(response) {
      return response;
    });
  }
  return factory;
});