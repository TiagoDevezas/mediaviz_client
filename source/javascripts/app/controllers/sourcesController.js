mediavizControllers.controller('SourcesCtrl', function($scope, $location, $filter, $timeout, $routeParams, $mdDialog, Page, SAPONews, SourceList) {

  Page.setTitle('Fontes');

  $scope.selectedSources = [];
  $scope.loadedSources = [];

  var timeFrame = $routeParams.by || 'DAY';

  $scope.sourceList = SourceList.getSAPONewsList();

  $scope.keyword = {value: ''};

  $scope.period = {
    since: "2015-01-01",
    until: moment().format("YYYY-MM-DD")
  }

  // $scope.since = "2015-01-01";
  // $scope.until = moment().format("YYYY-MM-DD");

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var sourceList = newVal['sources'];
    var keyword = newVal['keyword'];
    var since = newVal['since'];
    var until = newVal['until'];
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
      $scope.keyword.value = keyword;
      $scope.searchSwitch = true;
    }
    if(since) {
      $scope.period.since = since;
    }
    if(until) {
      $scope.period.until = until;
    }
  }, true);

  // $scope.$watch(function() { return $location.search()['sources'] }, function(newVal, oldVal) {
  //   if(newVal) {
  //     var selectedSources = [];
  //     var sourceArray = newVal.split(',').length ? newVal.split(',') : newVal;
  //     sourceArray.forEach(function(source) {
  //       var sourceObj = $filter('filter')($scope.sourceList, {name: source}, true)[0];
  //       selectedSources.push(sourceObj);
  //     });
  //     $scope.selectedSources = selectedSources;
  //   } else {
  //     $scope.clearChart();
  //   }
  // });

  $scope.checkValue = function(value) {
    if(value) {
      var domNode = document.getElementById("search-input");
      $timeout(function() {
        angular.element(domNode).focus();
      }, 0);
    } else {
      if($scope.keyword.value) $scope.clearInput();
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
    $scope.keyword.value = '';
    $scope.loadedSources = [];
    getSourceData();
    // $scope.setQuery();
  }

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

  $scope.$watch('keyword.value', function(newVal, oldVal) {
    if(newVal && newVal !== oldVal) {
      $location.search('keyword', newVal);
      $scope.loadedSources = [];
      getSourceData();
    } else {
      $location.search('keyword', null);
    }
  }, true);

  $scope.$watch('period', function(newVal, oldVal) {
    if(newVal) {
      $location.search('since', newVal.since);
      $location.search('until', newVal.until);
      $scope.loadedSources = [];
      getSourceData();
    }
  }, true);

  $scope.setQuery = function(value) {
    $scope.keyword.value = value;
  }

  $scope.clearChart = function() {
    $scope.selectedSources = [];
    $scope.keyword.value = null;
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
  		return {beginDate: $scope.period.since, endDate: $scope.period.until, timeFrame: timeFrame, q: $scope.keyword.value, source: value};
  	} else {
			return {beginDate: $scope.period.since, endDate: $scope.period.until, timeFrame: timeFrame, q: $scope.keyword.value, source: source.name};
		}
  }

  function getSourceData() {
  	$scope.selectedSources.forEach(function(source, index) {
			var sourceName = source.name;
      var timeId = 'timeFor' + sourceName;
			var countId = sourceName;
			var xsObj = {};
      xsObj[countId] = timeId;

      var paramsObj = createParamsObj(source);
  		if($scope.loadedSources.indexOf(sourceName) === -1) {
  			SAPONews.get(paramsObj).then(function(data) {
  				$scope.loadedSources.push(sourceName);
          var columns = [];
  				var dateAndCounts = data.data.facet_counts.facet_ranges.pubdate.counts;
  				var dates = dateAndCounts.map(function(el) {
            var momentDate = moment(el[0]);
  					return momentDate.format('YYYY-MM-DD');
  				});
  				dates.unshift(timeId);
  				var counts = dateAndCounts.map(function(el) {
  					return el[1];
  				});
  				counts.unshift(countId);
  				columns.push(dates, counts);
  				$scope.sapoData = columns;
          $scope.xsObj = xsObj;
				});
  		}
  	})
  }

  $scope.timeChartOpts = {
    size: {
      height: 450
    },
    legend: {
      position: 'bottom'
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