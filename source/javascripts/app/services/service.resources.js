mediavizServices.factory('Resources', function($resource, $q) {
    //var canceller = $q.defer();
  var baseUrl = 'http://irlab.fe.up.pt/p/newsir_api/';
  var opts = { 
    options: {
      method: 'GET',
      isArray: true,
        // cache: true, 
      params: {
        resource: '@resource'
      }
    }
  };
  return $resource(baseUrl + ':resource', {},
  {
    get: opts.options
  });
});