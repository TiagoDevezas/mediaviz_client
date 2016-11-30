mediavizServices.factory('Resources', function($resource, $q) {
    //var canceller = $q.defer();
  var baseUrl = 'http://irlab.fe.up.pt/p/mediaviz/api/';
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