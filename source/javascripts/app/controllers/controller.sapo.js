mediavizControllers.controller('SapoCtrl', function($scope, $location, $filter, $timeout, $routeParams, $mdDialog, Page, SAPONews, SAPODataFormatter, DataFormatter, SourceList) {

  Page.setTitle('SAPO Fontes');

  $scope.selectedSources = [];
  $scope.loadedSources = [];

  var timeFrame = 'DAY';

  $scope.sourceList = SourceList.getSAPONewsList();

  $scope.urlParams = {
    keyword: '',
    since: "2015-01-01",
    until: moment().format("YYYY-MM-DD"),
    by: 'day'
  }

  $scope.$watch(function() { return $location.search() }, function(newVal) {
    var sourceList = newVal['sources'];
    var keyword = newVal['keyword'];
    var since = newVal['since'];
    var until = newVal['until'];
    var by = newVal['by'];
    if(sourceList) {
      var selectedSources = [];
      var sourceArray = sourceList.split(',').length ? sourceList.split(',') : sourceList;
      sourceArray.forEach(function(source) {
        var sourceObj = $filter('filter')($scope.sourceList, {name: source}, true)[0];
        selectedSources.push(sourceObj);
      });
      $scope.selectedSources = selectedSources;
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
    $scope.inputKeyword = '';
    $location.search('keyword', null);
    $scope.urlParams.keyword = '';
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

  $scope.setQuery = function(value) {
    $scope.urlParams.keyword = value;
  }

  $scope.clearChart = function() {
    $scope.selectedSources = [];
    $scope.urlParams.keyword = null;
    $scope.inputKeyword = null;
    $scope.loadedSources = [];
    $location.search({});
  }


  function createParamsObj(source) {
  	if(source.name === 'Todas') {
      var array = source.value.split(',');
      var index = array.indexOf('Meios & Publicidade');
      array.splice(index, 1);
      var value = array.join(',');
  		return {beginDate: $scope.urlParams.since, endDate: $scope.urlParams.until, timeFrame: timeFrame, q: $scope.urlParams.keyword, source: value};
  	} else {
			return {beginDate: $scope.urlParams.since, endDate: $scope.urlParams.until, timeFrame: timeFrame, q: $scope.urlParams.keyword, source: source.name};
		}
  }

  function getSourceData() {
  	$scope.selectedSources.forEach(function(source, index) {
			var sourceName = source.name;
      var timeId = 'timeFor' + sourceName;
			var countId = sourceName;
			var xsObj = {};

      var paramsObj = createParamsObj(source);
  		if($scope.loadedSources.indexOf(sourceName) === -1) {
  			SAPONews.get(paramsObj).then(function(data) {
  				$scope.loadedSources.push(sourceName);
          xsObj[countId] = timeId;
          var data = data.data.facet_counts.facet_ranges.pubdate.counts;
          $scope.dayData = SAPODataFormatter.toColumns(data, timeId, countId, 'YYYY-MM-DD');

          var weekData = SAPODataFormatter.getWeekDays(data);
          $scope.weekData = DataFormatter.inColumns(weekData, countId, 'time', 'percent_of_source');

          var monthData = SAPODataFormatter.getMonths(data);
          $scope.monthData = DataFormatter.inColumns(monthData, countId, 'time', 'percent_of_source');

          setChartDataForCycle();

          $scope.xsObj = xsObj;
				});
  		}
  	})
  }

  function setChartDataForCycle() {
    if($scope.urlParams.by === 'day') {
      $scope.chartData = $scope.dayData;
      $scope.$broadcast('changeXAxisFormat', {type: 'timeseries', format: '%d %b %Y'});
    }
    if($scope.urlParams.by === 'week') {
      $scope.chartData = $scope.weekData;
      $scope.$broadcast('changeXAxisFormat', {type: '', format: function(d) { return moment().isoWeekday(d).format('ddd');} });
    }
    if($scope.urlParams.by === 'month') {
      $scope.chartData = $scope.monthData;
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