mediavizControllers.controller('NewsMapCtrl', function($scope, $filter, $timeout, $location, $q, Resources, Page, SourceList) {

  Page.setTitle('NewsMap');

  // SourceList.getDefaultList().then(function(data) {
  //   $scope.sourceList = data;
  //   var defaultSource1 = $filter('filter')($scope.sourceList, {acronym: $scope.defaultSource1}, true);
  //   var defaultSource2 = $filter('filter')($scope.sourceList, {acronym: $scope.defaultSource2}, true);
  //   $scope.selectedSource1 = defaultSource1[0];
  //   $scope.selectedSource2 = defaultSource2[0];
  // })

  SourceList.getDefaultList().then(function(data) {
    $scope.sourceList = data;
  });

  $scope.defaultSource1 = null;
  $scope.defaultSource2 = null;

  $scope.selectedSource1 = null;
  $scope.selectedSource2 = null;

  $scope.urlParams = {
    source1: null,
    source2: null,
    keyword1: null,
    keyword2: null,
    numMaps: 1
  };

  $scope.appendMap = function() {
    if($scope.urlParams.numMaps === 1) {
      $scope.urlParams.numMaps += 1;
      broadcastResize();
    }
  }

  function broadcastResize() {
    $timeout(function() {
      $scope.$broadcast("resizeMap");
    }, 0)
  }

  $scope.setQuery = function(keyword, mapId) {
    console.log(keyword, mapId);
    if(mapId === 'map1') {
      $scope.urlParams.keyword1 = keyword;
    }
    else if(mapId === 'map2') {
      $scope.urlParams.keyword2 = keyword;
    }
  }

  $scope.closeMap = function() {
    $scope.urlParams.numMaps = 1;
    broadcastResize();
  }

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var numMaps = newVal['numMaps'];
    var source1 = newVal['source1'];
    var source2 = newVal['source2'];
    var keyword1 = newVal['keyword1'];
    var keyword2 = newVal['keyword2'];
    if(numMaps && numMaps > 0 && numMaps < 3) {
      $scope.urlParams.numMaps = parseInt(numMaps);
      broadcastResize();
    }
    $timeout(function() {
      if(source1) {
        var sourceObj = $filter('filter')($scope.sourceList, {acronym: source1}, true)[0];
        $scope.urlParams.source1 = sourceObj;
      }
      if(source2) {
        var sourceObj = $filter('filter')($scope.sourceList, {acronym: source2}, true)[0];
        $scope.urlParams.source2 = sourceObj;
      }
      if(keyword1) {
        $scope.urlParams.keyword1 = keyword1;
      }
      if(keyword2) {
        $scope.urlParams.keyword2 = keyword2;
      }
    }, 500)
  }, true)

  $scope.$watch('urlParams', function(urlParams) {
    for (var key in urlParams) {
      if(urlParams[key] && urlParams[key].acronym) {
        $location.search(key, urlParams[key].acronym);
      } else if(urlParams[key]) {
        $location.search(key, urlParams[key])
      }
    }   
  }, true);


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