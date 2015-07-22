mediavizControllers.controller('KeywordsCtrl', function($scope, $rootScope, $location, $filter, Page, SourceList, SAPONews, SAPODataFormatter, Resources, DataFormatter) {

  Page.setTitle('Palavras-chave');

  if($location.path().indexOf('/SAPO') !== -1) {
    $scope.SAPOMode = true;
  }

  $scope.loadedKeywords = [];

  $scope.keywords = {};
  $scope.keywords.selected = [];

  $scope.loadingQueue = [];

  $scope.urlParams = {
    source: null,
    since: "2015-01-01",
    until: moment().format("YYYY-MM-DD"),
    by: 'day',
    data: 'articles'
  }

  if($scope.SAPOMode) {
    $scope.sourceList = SourceList.getSAPONewsList();
    $scope.defaultSource = 'Todas';
    $scope.urlParams.source = $filter('filter')($scope.sourceList, {name: $scope.defaultSource}, true)[0];
    // $scope.selectedIndex.value = 0;
  } else {
    SourceList.getDefaultList().then(function(data) {
      $scope.sourceList = data;
      $scope.defaultSource = 'national'
      $scope.urlParams.source = $filter('filter')($scope.sourceList, {acronym: $scope.defaultSource}, true)[0];
    });
  }

  $scope.clearChart = function() {
    $scope.keywords.selected = [];
    $scope.loadedKeywords = [];
    $location.search('keywords', null);
  }

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var keywords = $location.search()['keywords'];
    var source = $location.search()['source'];
    var since = $location.search()['since'];
    var until = $location.search()['until'];
    var by = $location.search()['by'];
    var dataType = $location.search()['data'];
    var keywordArray = [];
    if(source) {
      $scope.urlParams.source = $filter('filter')($scope.sourceList, {name: source}, true)[0];
    }
    if(keywords && keywords.length) {
      if(keywords.split(',').length === 1) {
        keywordArray.push(keywords);
      }
      if(keywords.split(',').length > 1) {
        keywordArray = keywords.split(',');
      }
      $scope.keywords.selected = keywordArray;
    }
    if(since) {
      $scope.urlParams.since = since;
    }
    if(until) {
      $scope.urlParams.until = until;
    }
    if(by) {
      $scope.urlParams.by = by;
    }
    if(dataType) {
      $scope.urlParams.data = dataType;
    }
  }, true);

  $scope.$watch('keywords.selected', function(newVal, oldVal) {
    var newKeywords = newVal.map(function(el) { return el });
    var oldKeywords = oldVal.map(function(el) { return el });
    oldKeywords.forEach(function(oldKeyword) {
      if(newKeywords.indexOf(oldKeyword) === -1) {
        $scope.loadedKeywords.splice($scope.loadedKeywords.indexOf(oldKeyword), 1);
        $scope.$broadcast('sourceRemoved', oldKeyword);
      }
    })
    if(newVal.length > 0 && newVal !== '') {
      $location.search('keywords', newVal.toString());
      getSourceData();
    } else {
      $scope.clearChart();
    }
  }, true);

  $scope.$watch('urlParams', function(urlParams) {
    for (var key in urlParams) {
      if(urlParams[key] && urlParams[key].name) {
        $location.search(key, urlParams[key].name);
      } else if(urlParams[key]) {
        $location.search(key, urlParams[key])
      } else if(!urlParams[key]) {
        $location.search(key, null)
        return;
      }
    }
    $scope.loadedKeywords = [];
    getSourceData();
  }, true);

  $scope.$watch('loadingQueue', function(newVal, oldVal) {
    if($scope.loadingQueue.length !== 0) {
      $rootScope.loading = true;
    } else {
      $rootScope.loading = false;
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

  function createSAPOParamsObj(keyword) {
    return {beginDate: $scope.urlParams.since, endDate: $scope.urlParams.until, timeFrame: $filter('uppercase')($scope.urlParams.by), q: tokenizeKeyword(keyword), source: $scope.urlParams.source.value};
  }

  function createParamsObj(keyword) {
   if($scope.urlParams.source.group) {
    return {resource: 'totals', since: $scope.urlParams.since, until: $scope.urlParams.until, type: $scope.urlParams.source.type, q: keyword};    
   } else {
    return {resource: 'totals', since: $scope.urlParams.since, until: $scope.urlParams.until, source: $scope.urlParams.source.acronym, q: keyword};
   }
  }

  function getSourceData() {
    if(!$scope.urlParams.source) {
      return;
    }
    $scope.keywords.selected.forEach(function(keyword, index) {
      var keywordName = keyword;
      var timeId = 'timeFor' + keywordName;
      var countId = keywordName;
      var xsObj = {};

      if($scope.loadedKeywords.indexOf(keywordName) === -1) {
        $scope.loadingQueue.push(keyword);
        if($scope.SAPOMode) {
          var paramsObj = createSAPOParamsObj(keyword);
          SAPONews.get(paramsObj).then(function(data) {
            $scope.loadingQueue.splice($scope.loadingQueue.indexOf(keyword), 1);
            $scope.loadedKeywords.push(keywordName);
            xsObj[countId] = timeId;
            var data = data.data.facet_counts.facet_ranges.pubdate.counts
            data = SAPODataFormatter.getDays(data);

            $scope.timeData = DataFormatter.inColumns(data, keyword, 'time', 'articles');
            $scope.countData = DataFormatter.countOnly(data, keyword, 'total_articles');
            console.log($scope.countData);

            $scope.xsObj = xsObj;
          });
        } else {
          var paramsObj = createParamsObj(keyword);
          Resources.get(paramsObj).$promise.then(function(data) {
            $scope.loadingQueue.splice($scope.loadingQueue.indexOf(keyword), 1);
            $scope.loadedKeywords.push(keywordName);
            xsObj[countId] = timeId;
            $scope.timeData = DataFormatter.inColumns(data, keyword, 'time', $scope.urlParams.data);

            $scope.xsObj = xsObj;
          });
        }
      }
    })
  }

$scope.donuChart = {
  data: {
      type : 'donut',
      onclick: function (d, i) { console.log("onclick", d, i); },
      onmouseover: function (d, i) { console.log("onmouseover", d, i); },
      onmouseout: function (d, i) { console.log("onmouseout", d, i); }
  },
  donut: {
      title: "Artigos"
  }
}

$scope.timeChartOpts = {
    size: {
      height: 450
    },
    legend: {
      position: 'right'
    },
    tooltip: {
      grouped: true 
    },
    data: {
    },
    point: {
      r: 1.5
    },
    subchart: {
      show: true
    },
    transition: {
      duration: 0
    },
    axis: {
      x: {
          padding: {left: 0, right: 0},
          type: 'timeseries',
          tick: {
            culling: {
              max: 5 // the number of tick texts will be adjusted to less than this value
            },
            format: '%d %b %Y'
          }
        },
        y: {
          min: 0,
          padding: {bottom: 0},
        }
      },
      tooltip: {
      },
      grid: {
        x: {
          show: false
        },
        y: {
          show: true
        }
      }
  };


});