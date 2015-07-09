mediavizControllers.controller('NewsMapCtrl', function($scope, Resources, Page) {

  Page.setTitle('NewsMap');

  $scope.defaultSource = null;

  $scope.numMaps = 1;

  $scope.visibleMaps = [
    {name: 'map1', visible: true}
  ];

  $scope.appendMap = function() {
    if($scope.numMaps === 1) {
      $scope.numMaps += 1;
      $scope.$broadcast("resizeMap");
    }
  }

  $scope.paramsObj = {resource: 'places', since: null, until: null, type: 'national', q: null, lang: 'pt', map: 'world'};

  // getMapData();

  function getMapData() {
    $scope.loading = true;
    Resources.get($scope.paramsObj).$promise.then(function(data) {
      $scope.loading = false;
      // $scope.mapData = data;
      // console.log($scope.mapData);
    });
  }

});