mediavizServices.factory('Resources', function($resource, $q) {
    //var canceller = $q.defer();
  var baseUrl = 'http://maltese.fe.up.pt/irnews/';
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