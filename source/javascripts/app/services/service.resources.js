mediavizServices.factory('Resources', function($resource, $q) {
    //var canceller = $q.defer();
  var baseUrl = 'http://localhost:4567/';
  var jsonp = { 
    options: {
      // method: 'JSONP',
      isArray: true,
        // cache: true, 
      params: {
        // callback: 'JSON_CALLBACK',
        resource: '@resource'
      }
    }
  };
  return $resource(baseUrl + ':resource', {},
  {
    get: jsonp.options
  });
});