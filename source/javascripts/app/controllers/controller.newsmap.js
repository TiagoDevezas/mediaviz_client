mediavizControllers.controller('NewsMapCtrl', function($scope, $rootScope, $filter, $timeout, $location, $q, Resources, Page, SourceList, SAPONews) {

  Page.setTitle('NewsMap');

  if($location.path().indexOf('/SAPO') !== -1) {
    $scope.SAPOMode = true;
  }

  if($scope.SAPOMode) {
    $scope.sourceList = SourceList.getSAPONewsList();
  } else {
    SourceList.getDefaultList().then(function(data) {
      $scope.sourceList = data;
    });
  }

  $scope.mapTypes = [
    {name: 'Mundo', type: 'world'}, 
    {name: 'Portugal', type: 'portugal'}
  ];

  $scope.lang = 'pt';

  $scope.urlParams = {
    since: $rootScope.startDate,
    until: $rootScope.endDate
  }

  $scope.selectedMap = $scope.mapTypes[0];

  $scope.loadingQueue = [];

  $scope.setSelectedMap = function(mapType) {
    $scope.selectedMap = mapType;
    var mapsDisplayed = displayedMapsArray();
    mapsDisplayed.forEach(function(mapObj) {
      getMapData(mapObj);
    });
  }

  function displayedMapsArray() {
    var mapsDisplayed = $scope.mapsToRender.filter(function(obj) {
      return obj.display;
    });
    return mapsDisplayed;
  }

  $scope.mapsToRender = [
    {name: 'map1', source: undefined, keyword: undefined, display: true, data: undefined },
    {name: 'map2', source: undefined, keyword: undefined, display: false, data: undefined }
  ];

  $scope.$on('countryClickEvent', function(evt, data) {
    if($scope.SAPOMode) return;
    var countryName = data.country;
    var mapId = data.mapId;
    var mapObj = $filter('filter')($scope.mapsToRender, {name: mapId}, true)[0];
    var source = mapObj.source.name;
    var since = $scope.urlParams.since;
    var until = $scope.urlParams.until;
    var keyword = null;
    if(mapObj.keyword) {
      keyword = countryName + ' && ' + mapObj.keyword
    } else {
      keyword = countryName;
    }
    setParamsforArticles(since, until, keyword, source);
  });

  function setParamsforArticles(since, until, keyword, source) {
    $location.path('/articles').search({keyword: keyword, since: since, until: until, source: source });
    $scope.$apply();
  }

  $scope.countDisplayMaps = function() {
    var displayed = $scope.mapsToRender.filter(function(obj) {
      return obj.display;
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
    broadcastResize();
  }

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var since = newVal['since'];
    var until = newVal['until'];
    if(since) {
      $scope.urlParams.since = since;
    }
    if(until) {
      $scope.urlParams.until = until;
    }
  }, true)

  $scope.$watch('urlParams', function(urlParams) {
    if(urlParams) {
      var displayed = $filter('filter')($scope.mapsToRender, {display: true}, true);
      displayed.forEach(function(mapObj) {
        getMapData(mapObj);
      });
    } 
  }, true);

  $scope.$watch('loadingQueue', function(newVal, oldVal) {
    if($scope.loadingQueue.length !== 0) {
      $rootScope.loading = true;
    } else {
      $rootScope.loading = false;
    }
  }, true);

  // $scope.$watch('countDisplayMaps()', function(newVal) {
  //   $location.search('numMaps', newVal);
  // });

  $scope.$watch(function() { return $scope.mapsToRender[0].source }, function(newVal) {
    if(newVal) {
      if(newVal.type === 'international') { 
        $scope.lang = 'en';
      } else {
        $scope.lang = 'pt';
      }
      getMapData($scope.mapsToRender[0]);
    }
  }, true);

  $scope.$watch(function() { return $scope.mapsToRender[1].source }, function(newVal) {
    if(newVal) {
      if(newVal.type === 'international') { 
        $scope.lang = 'en';
      } else {
        $scope.lang = 'pt';
      }
      getMapData($scope.mapsToRender[1]);
    }
  }, true);

  function tokenizeKeyword(keyword) {
    if(keyword) {
      var keyword = keyword.trim().split(' ').join(' AND ');
      return keyword;
    } else {
      return undefined;
    }
  }

  function createSAPOParamsObj(query, source) {
    return {beginDate: $scope.urlParams.since, endDate: $scope.urlParams.until,  q: query, source: source};
  }

  function createParamsObj(mapObj) {
    if(mapObj.source.group) {
      return {resource: 'places', since: $scope.urlParams.since, until: $scope.urlParams.until, type: mapObj.source.type, q: mapObj.keyword, map: $scope.selectedMap.type, lang: $scope.lang};    
    } else {
      return {resource: 'places', since: $scope.urlParams.since, until: $scope.urlParams.until, source: mapObj.source.name, q: mapObj.keyword, map: $scope.selectedMap.type, lang: $scope.lang};
    }
  }

  function getMapData(mapObj) {
    if($scope.mapsToRender[0].source || $scope.mapsToRender[1].source) {
      $rootScope.loading = true;
      if($scope.SAPOMode) {
        Resources.get({resource: 'places', map: $scope.selectedMap.type, listOnly: 'true'}).$promise.then(function(data) {
          data = data.filter(function(el) { return el.name != null; });
          getPlacesCounts(data, mapObj).then(function(data) {
            $rootScope.loading = false;
            mapObj.data = data;
          });
        });
      } else {
         var paramsObj = createParamsObj(mapObj);
         Resources.get(paramsObj).$promise.then(function(data) {
          data = data.filter(function(el) { return el.name != null; });
           // $scope.loadedMaps.push(mapObj.name);
          $rootScope.loading = false;
          mapObj.data = data;
         });       
      }
    }
  }

  function removeParentheses(string) {
    var cleanString = string;
    if(cleanString) {
      if(cleanString.indexOf('(') !== -1) {
        cleanString = cleanString.replace('(', '');
      }
      if(cleanString.indexOf(')') !== -1) {
        cleanString = cleanString.replace(')', '');
      }
    } else {
      cleanString = null;
    }
    return cleanString;
  }

  function getPlacesCounts(data, mapObj) {
    var deferred = $q.defer();
    var count = 0;
    var data = data;
    data.forEach(function(obj) {
      var placeName = removeParentheses(obj.name);
      var query = mapObj.keyword ? tokenizeKeyword(placeName + " " + mapObj.keyword) : tokenizeKeyword(placeName);
      var sourceName = mapObj.source.name !== 'Todas' ? mapObj.source.name : null;
      var paramsObj = createSAPOParamsObj(query, sourceName);
      SAPONews.get(paramsObj).then(function(sapoData) {
        if(sapoData) {
          var sData = sapoData.data.facet_counts.facet_ranges.pubdate.counts;
          var countSum = d3.sum(sData, function(el) {
            return el[1];
          });
          obj['count'] = countSum;
        } else {
          obj['count'] = 0;
        }
        count++;
        if(count === data.length) {
          deferred.resolve(data);
        }
      });
    });
    return deferred.promise;
  }

});