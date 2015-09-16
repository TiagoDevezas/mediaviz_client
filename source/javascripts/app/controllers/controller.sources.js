mediavizControllers.controller('SourcesCtrl', function($scope, $rootScope, $location, $filter, $timeout, $routeParams, $mdDialog, Page, SAPONews, SAPODataFormatter, DataFormatter, SourceList, Resources) {

  Page.setTitle('Fontes');

  if($location.path().indexOf('/SAPO') !== -1) {
    $scope.SAPOMode = true;
  }

  $scope.selectedSources = [];
  $scope.loadedSources = [];

  $scope.loadingQueue = [];

  var timeFrame = 'DAY';

  // $scope.selectedIndex.value = 1;

  if($scope.SAPOMode) {
    $scope.sourceList = SourceList.getSAPONewsList();
  } else {
    SourceList.getDefaultList().then(function(data) {
      $scope.sourceList = data;
    });
  }

  $scope.urlParams = {
    keyword: null,
    since: "2015-01-01",
    until: moment().format("YYYY-MM-DD"),
    by: 'day',
    data: 'articles'
  }

  $scope.$watch(function() { return $location.search() }, function(newVal) {
    var sourceList = newVal['sources'];
    var keyword = newVal['keyword'];
    var since = newVal['since'];
    var until = newVal['until'];
    var by = newVal['by'];
    var dataType = $location.search()['data'];
    if(sourceList) {
      var selectedSources = [];
      var sourceArray = sourceList.split(',').length ? sourceList.split(',') : sourceList;
      $timeout(function() {
        sourceArray.forEach(function(source) {
          var sourceObj = $filter('filter')($scope.sourceList, {name: source}, true)[0];
          selectedSources.push(sourceObj);
        });
        $scope.selectedSources = selectedSources;

      }, 500)
    }
    if(keyword) {
      $scope.inputKeyword = keyword;
      $scope.urlParams.keyword = keyword;
      $scope.searchSwitch = true;
    } else {
      // $scope.clearInput();
      $scope.searchSwitch = false;
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

  $scope.checkValue = function(value) {
    if(value) {
      var domNode = document.getElementById("search-input");
      $timeout(function() {
        angular.element(domNode).focus();
      }, 0);
    } else {
      if($scope.urlParams.keyword) $scope.clearInput();
    }
  }

  // $scope.showPickerDialog = function(ev) {
  //   $mdDialog.show({
  //     parent: angular.element(document.body),
  //     templateUrl: 'partials/app/picker_dialog.html',
  //     targetEvent: ev
  //   });
  // }

  $scope.clearInput = function() {
    $scope.inputKeyword = null;
    $location.search('keyword', null);
    $scope.urlParams.keyword = null;
  }

  $scope.chartData;

  $scope.$watch('selectedSources', function(newVal, oldVal) {
    var sources = newVal.map(function(el) { return el.name }) || null;
    var oldSources = oldVal.map(function(el) { return el.name });
    oldSources.forEach(function(oldSource) {
      if(sources.indexOf(oldSource) === -1) {
        $scope.loadedSources.splice($scope.loadedSources.indexOf(oldSource), 1);
        $scope.$broadcast('sourceRemoved', oldSource);
      }
    })
  	if(newVal.length > 0 && newVal !== '') {
  		var sources = newVal.map(function(el) { return el.name });
      $location.search('sources', sources.join(','));
      getSourceData();
  	} else {
      $scope.clearChart();
    }
  }, true);

  $scope.$watch('urlParams', function(urlParams) {
    for (var key in urlParams) {
      urlParams[key] ? $location.search(key, urlParams[key]) : null;
    }
    $scope.loadedSources = [];
    getSourceData();      
  }, true);

  $scope.$watch('loadingQueue', function(newVal, oldVal) {
    if($scope.loadingQueue.length !== 0) {
      $rootScope.loading = true;
    } else {
      $rootScope.loading = false;
    }
  }, true);

  $scope.setQuery = function(value) {
    $scope.urlParams.keyword = value;
  }

  $scope.clearChart = function() {
    $scope.selectedSources = [];
    $scope.urlParams.keyword = null;
    $scope.inputKeyword = null;
    $scope.loadedSources = [];
    $location.search('sources', null);
  }


  function createSAPOParamsObj(source) {
		return {beginDate: $scope.urlParams.since, endDate: $scope.urlParams.until, timeFrame: timeFrame, q: tokenizeKeyword($scope.urlParams.keyword), source: source.value};
  }

  function createParamsObj(source) {
    if(source.group) {
      return {resource: 'totals', since: $scope.urlParams.since, until: $scope.urlParams.until, type: source.type, q: $scope.urlParams.keyword, by: $scope.urlParams.by};    
    } else {
      return {resource: 'totals', since: $scope.urlParams.since, until: $scope.urlParams.until, source: source.acronym, q: $scope.urlParams.keyword, by: $scope.urlParams.by};
    }   
  }

  function tokenizeKeyword(keyword) {
    if(keyword) {
      var keyword = keyword.trim().split(' ').join(' AND ');
      return keyword;
    } else {
      return undefined;
    }
  }

  function getSourceData() {
  	$scope.selectedSources.forEach(function(source, index) {
			var sourceName = source.name;
      var timeId = 'timeFor' + sourceName;
			var countId = sourceName;
			var xsObj = {};

      if($scope.loadedSources.indexOf(sourceName) === -1) {
        $scope.loadingQueue.push(sourceName);
        if($scope.SAPOMode) {
          var paramsObj = createSAPOParamsObj(source);
    			SAPONews.get(paramsObj).then(function(data) {
    				$scope.loadedSources.push(sourceName);
            $scope.loadingQueue.splice($scope.loadingQueue.indexOf(sourceName), 1);
            xsObj[countId] = timeId;
            var data = data.data.facet_counts.facet_ranges.pubdate.counts;
            dayData = SAPODataFormatter.getDays(data);
            $scope.dayData = DataFormatter.inColumns(dayData, sourceName, 'time', 'articles');

            var weekData = SAPODataFormatter.getWeekDays(data);
            $scope.weekData = DataFormatter.inColumns(weekData, countId, 'time', 'percent_of_source');

            var monthData = SAPODataFormatter.getMonths(data);
            $scope.monthData = DataFormatter.inColumns(monthData, countId, 'time', 'percent_of_source');

            setChartDataForCycle();

            $scope.xsObj = xsObj;
  				});
        } else {
          var paramsObj = createParamsObj(source);
          Resources.get(paramsObj).$promise.then(function(data) {
            $scope.loadedSources.push(sourceName);
            $scope.loadingQueue.splice($scope.loadingQueue.indexOf(sourceName), 1);
            xsObj[countId] = timeId;
            $scope.chartData = DataFormatter.inColumns(data, sourceName, 'time', $scope.urlParams.data);

            setChartDataForCycle();

            $scope.xsObj = xsObj;
          });
        }
  		}
  	})
  }

  function setChartDataForCycle() {
    if($scope.urlParams.by === 'day') {
      if($scope.SAPOMode) {
        $scope.chartData = $scope.dayData;
      }
      $scope.$broadcast('changeXAxisFormat', {type: 'timeseries', format: '%d %b %Y'});
    }
    if($scope.urlParams.by === 'week') {
      if($scope.SAPOMode) {
        $scope.chartData = $scope.weekData;
      }
      $scope.$broadcast('changeXAxisFormat', {type: '', format: function(d) { return moment().isoWeekday(d).format('ddd');} });
    }
    if($scope.urlParams.by === 'month') {
      if($scope.SAPOMode) {
        $scope.chartData = $scope.monthData;
      }
      $scope.$broadcast('changeXAxisFormat', {type: '', format: function(d) { return moment(d, 'MM').format('MMM');}});
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