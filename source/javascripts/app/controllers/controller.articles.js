mediavizControllers.controller('ArticlesCtrl', function($scope, $timeout, $filter, $location, $rootScope, Page, Resources, SourceList, DataFormatter) {
	
	Page.setTitle('Artigos');

  $scope.urlParams = {
    source: null,
    keyword: null,
    since: "2015-01-01",
    until: moment().format("YYYY-MM-DD")
  }

  $scope.sourceList;

  $scope.items;

  $scope.chartData;

  SourceList.getDefaultList().then(function(data) {
    $scope.sourceList = data;
    $scope.defaultSource = 'Todas nacionais';
    if(!$location.search()['source']) {
      $scope.urlParams.source = $filter('filter')($scope.sourceList, {name: $scope.defaultSource}, true)[0];
    }
    initializeController();
  });

  $scope.timeChartOpts = {
    size: {
    },
    legend: {
      position: 'bottom'
    },
    tooltip: {
      grouped: false 
    },
    data: {
      onclick: function (d, i) { showArticles(d); }
    },
    point: {
      r: 1.5
    },
    subchart: {
      show: false
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
            tick: {
              format: function(d) {
                if($scope.urlParams.data === 'percent') {
                  return d + '%';
                } else {
                  return d;
                }
              }
            }
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

  function initializeController() {


  	var itemsToLoad = 20;

  	var itemsOffset = 0;

    $scope.fetching = false;
    $scope.disabled = false;

  	$scope.predicate = 'pub_date';
    $scope.reverse = true;

    $scope.order = function(predicate) {
    	if(predicate === 'pub_date') {
      	$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
    	} else {
    		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : true;
    	}
      $scope.predicate = predicate;
    };

    $scope.loadingQueue = [];

    $scope.$watch(function() { return $location.search() }, function(newVal) {
    	var source = $location.search()['source'];
    	var keyword = $location.search()['keyword'];
      var since = $location.search()['since'];
      var until = $location.search()['until'];
  		if(source) {
          $scope.urlParams.source = $filter('filter')($scope.sourceList, {name: source}, true)[0];
      }
      if(keyword) {
        $scope.inputKeyword = keyword;
        $scope.urlParams.keyword = keyword;
      }
      if(since) {
        $scope.urlParams.since = since;
      }
      if(until) {
        $scope.urlParams.until = until;
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
        }
      }
      if($scope.urlParams.source) {
        getItems();
      }
    }, true);

    $scope.$watch('loadingQueue', function(newVal, oldVal) {
      if($scope.loadingQueue.length !== 0) {
        $rootScope.loading = true;
      } else {
        $rootScope.loading = false;
      }
    }, true);

    $scope.setQuery = function(value) {
    	if(value) {
      	$scope.urlParams.keyword = value;
    	} else {
    		$scope.urlParams.keyword = null;
    	}
    }

    function createParamsObj() {
      if($scope.urlParams.source.group) {
        return {resource: 'items', since: $scope.urlParams.since, limit: itemsToLoad, until: $scope.urlParams.until, type: $scope.urlParams.source.type, q: $scope.urlParams.keyword};    
      } else {
        return {resource: 'items', since: $scope.urlParams.since, limit: itemsToLoad, until: $scope.urlParams.until, source: $scope.urlParams.source.acronym, q: $scope.urlParams.keyword};
      }
    }

    function createParamsObjOffset() {
      if($scope.urlParams.source.group) {
        return {resource: 'items', since: $scope.urlParams.since, until: $scope.urlParams.until, type: $scope.urlParams.source.type, q: $scope.urlParams.keyword, offset: itemsOffset};    
      } else {
        return {resource: 'items', since: $scope.urlParams.since, until: $scope.urlParams.until, source: $scope.urlParams.source.acronym, q: $scope.urlParams.keyword, offset: itemsOffset};
      }
    }

    function createParamsObjTotals(startDate) {
      if($scope.urlParams.source.group) {
        return {resource: 'totals', since: startDate, until: $scope.urlParams.until, type: $scope.urlParams.source.type, q: $scope.urlParams.keyword };    
      } else {
        return {resource: 'totals', since: startDate, until: $scope.urlParams.until, source: $scope.urlParams.source.acronym, q: $scope.urlParams.keyword };
      }
    }


  	// getItems();

    $scope.getMore = function() {
      itemsOffset = itemsOffset + itemsToLoad;
      $scope.fetching = true; // Block fetching until the AJAX call returns
      if($scope.urlParams.source) {
        $rootScope.loading = true;
      }
      var paramsObj = createParamsObjOffset();
      Resources.get(paramsObj).$promise.then(function(data) {
        $scope.fetching = false;
        if($scope.urlParams.source) {
          $rootScope.loading = false;
        }
        if(data.length) {
          $scope.items = $scope.items.concat(data);
        } else {
          $scope.disabled = true;
        }
      });
    };
  	
  	function getItems() {
  		if($scope.urlParams.source) {
  			$rootScope.loading = true;
  		}
  		var paramsObj = createParamsObj();
  		Resources.get(paramsObj).$promise.then(function(data) {
  			if($scope.urlParams.source) {
  				$rootScope.loading = false;
  			}
  			$scope.items = data;
        if($scope.urlParams.keyword) {
          getChartData()
        }
  		});
  	}

    function getChartData() {
      var oneWeekAgo = moment($scope.urlParams.until).subtract(7, 'days').format('YYYY-MM-DD');
      var keywordName = $scope.urlParams.keyword;
      var timeId = 'timeFor' + keywordName;
      var countId = keywordName;
      var xsObj = {};
      var paramsObj = createParamsObjTotals(oneWeekAgo);
      Resources.get(paramsObj).$promise.then(function(data) {
        xsObj[countId] = timeId;
        $scope.chartData = DataFormatter.inColumns(data, $scope.urlParams.keyword, 'time', 'articles');
        $scope.xsObj = xsObj;
      });
    }

  }
});