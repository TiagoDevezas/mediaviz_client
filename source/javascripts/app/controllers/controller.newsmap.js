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

  $scope.mapsToRender = [
    {name: 'map1', source: undefined, keyword: undefined, display: true, data: undefined },
    {name: 'map2', source: undefined, keyword: undefined, display: false, data: undefined }
  ];

  $scope.loadedMaps = [];

  // $scope.urlParams = {};

  // $scope.$watch('mapsToRender', function(newVal) {
  //   createUrlParams();
  // }, true);

  // function createUrlParams() {
  //   $scope.urlParams = {
  //     source1: $scope.mapsToRender[0].source,
  //     source2: $scope.mapsToRender[1].source
  //     // keyword1: $scope.mapsToRender[0].keyword,
  //     // keyword2: $scope.mapsToRender[1].keyword
  //     // numMaps: null
  //   };
  // }



  $scope.countDisplayMaps = function() {
    var displayed = $scope.mapsToRender.filter(function(obj) {
      return obj.display
    });
    return displayed.length;
  }

  $scope.appendMap = function() {
    var displayedCount = $scope.countDisplayMaps();
    if(displayedCount === 1) {
      var hiddenMap = $filter('filter')($scope.mapsToRender, {display: false}, true)[0];
      hiddenMap.display = true;
      broadcastResize();
    }
  }

  function broadcastResize() {
    $timeout(function() {
      $scope.$broadcast("resizeMap");
    }, 0)
  }

  $scope.setQuery = function(keyword, mapObj) {
    mapObj.keyword = keyword;
    getMapData(mapObj);
  }

  $scope.closeMap = function(mapName) {
    var foundMap = $filter('filter')($scope.mapsToRender, {name: mapName}, true)[0];
    foundMap.display = false;
    foundMap.source = undefined;
    foundMap.keyword = undefined;
    if($scope.loadedMaps.indexOf(foundMap.name !== -1)) {
      var mapIndex = $scope.loadedMaps.indexOf(foundMap.name);
      $scope.loadedMaps.splice(mapIndex, 1);
    }
    broadcastResize();
  }

  // $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
  //   var numMaps = newVal['numMaps'];
  //   var source1 = newVal['source1'];
  //   var source2 = newVal['source2'];
  //   var keyword1 = newVal['keyword1'];
  //   var keyword2 = newVal['keyword2'];
  //   // if(numMaps && numMaps > 0 && numMaps < 3) {
  //   //   $scope.urlParams.numMaps = parseInt(numMaps);
  //   //   broadcastResize();
  //   // }
  //     if(source1) {
  //       $timeout(function() {
  //         var sourceObj = $filter('filter')($scope.sourceList, {acronym: source1}, true)[0];
  //         $scope.mapsToRender[0].source = sourceObj;
  //       }, 500);
  //       // $scope.urlParams.source1 = sourceObj;
  //     }
  //     if(source2) {
  //       $timeout(function() {
  //         var sourceObj = $filter('filter')($scope.sourceList, {acronym: source2}, true)[0];
  //         $scope.mapsToRender[1].source = sourceObj;
  //       }, 500);
        
  //       // $scope.urlParams.source2 = sourceObj;
  //     }
  //   if(keyword1) {
  //     $scope.mapsToRender[0].keyword = keyword1;
  //     // $scope.urlParams.keyword1 = keyword1;
  //   }
  //   if(keyword2) {
  //     $scope.mapsToRender[1].keyword = keyword2;
  //     // $scope.urlParams.keyword2 = keyword2;
  //   }

  // }, true)

  // $scope.$watch('urlParams', function(urlParams) {
  //   for (var key in urlParams) {
  //     if(urlParams[key] && urlParams[key].acronym) {
  //       $location.search(key, urlParams[key].acronym);
  //     } else if(urlParams[key]) {
  //       $location.search(key, urlParams[key])
  //     }
  //   }
  //   getMapData();  
  // }, true);

  // $scope.$watch('countDisplayMaps()', function(newVal) {
  //   $location.search('numMaps', newVal);
  // });

  function createParamsObj(mapObj) {
    if(mapObj.source.group) {
      return {resource: 'places', since: null, until: null, type: mapObj.source.type, q: mapObj.keyword, map: 'world'};    
    } else {
      return {resource: 'places', since: null, until: null, source: mapObj.source.name, q: mapObj.keyword, map: 'world'};
    }
  }

  $scope.$watch(function() { return $scope.mapsToRender[0].source }, function(newVal) {
    if(newVal) {
      getMapData($scope.mapsToRender[0]);
    }
  }, true);

  $scope.$watch(function() { return $scope.mapsToRender[1].source }, function(newVal) {
    if(newVal) {
      getMapData($scope.mapsToRender[1]);
    }
  }, true);

  // getMapData();

  function getMapData(mapObj) {
    $scope.loading = true;
    var paramsObj = createParamsObj(mapObj);
    Resources.get(paramsObj).$promise.then(function(data) {
      // $scope.loadedMaps.push(mapObj.name);
      $scope.loading = false;
      mapObj.data = data;
    });
  }

  // function getMapData() {
  //   var mapsDisplayed = $scope.mapsToRender.filter(function(obj) {
  //     return obj.display;
  //   });
  //   $scope.loading = true;
  //   mapsDisplayed.forEach(function(mapObj) {
  //     if($scope.loadedMaps.indexOf(mapObj.name === -1)) {
  //       var paramsObj = createParamsObj(mapObj);
  //       Resources.get(paramsObj).$promise.then(function(data) {
  //         $scope.loadedMaps.push(mapObj.name);
  //         $scope.loading = false;
  //         mapObj.data = data;
  //         // console.log($scope.mapData);
  //       });       
  //     };
  //   });
  // };

});