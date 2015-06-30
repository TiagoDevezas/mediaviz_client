mediavizControllers.controller('SourcesCtrl', function($scope, $location, $filter, $timeout, $routeParams, Page, SAPONews, SourceList) {

  Page.setTitle('Fontes');

  $scope.selectedSources = [];
  $scope.loadedSources = [];

  $scope.since = "2014-06-31";
  $scope.until = null;

  var timeFrame = $routeParams.by || 'DAY';

  $scope.sourceList = SourceList.getSAPONewsList();

  $scope.keyword = {value: ''};

  // $scope.$on('$routeUpdate', function(){
  //   var locationObj = $location.search();
  //   var sources = locationObj.sources.split(',');
  //   var keyword = locationObj.keyword;
  //   var since = locationObj.since;

  //   var newSourcesArray = [];
  //   sources.forEach(function(el) {
  //     var sourceObj = $filter('filter')($scope.sourceList, {name: el}, true)[0];
  //     newSourcesArray.push(sourceObj);
  //   });
  //   $scope.selectedSources = newSourcesArray;
  //   $scope.keyword.value = keyword;
  //   $scope.loadedSources = [];
  //   getSourceData();
    
  // });

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    if(newVal) {
      $scope.loadedSources = [];
      getSourceData();
    }
    // var sources = locationObj['sources'];
    // var keyword = locationObj['keyword'];
    // var until = locationObj['until'];
    // var since = locationObj['since'];
    // if(sources) {
    //   sources = sources.split(',');
    //   var newSourcesArray = [];
    //   sources.forEach(function(el) {
    //     var sourceObj = $filter('filter')($scope.sourceList, {name: el}, true)[0];
    //     newSourcesArray.push(sourceObj);
    //   });
    //   $scope.selectedSources = newSourcesArray;
    //   if(keyword) {
    //     $scope.keyword.value = keyword;
    //   }
    // } else {
    //   $location.search('sources', null);
    // }
    // if(keyword) {
    //   $scope.loadedSources = [];
    //   $scope.keyword.value = keyword;
    // } else {
    //   $scope.keyword.value = null;
    //   $scope.loadedSources = [];
    // }
    // if(until) {
    //   $scope.until = until;
    // }
    // if(since) {
    //   $scope.since = since;
    // }
    // getSourceData();
  }, true);

  $scope.checkValue = function(value) {
    if(value) {
      var domNode = document.getElementById("search-input");
      $timeout(function() {
        angular.element(domNode).focus();
      }, 0);
    }
  }

  $scope.clearQuery = function() {
    $scope.keyword.value = null;
    $scope.loadedSources = [];
    $scope.setQuery();
  }

  $scope.$watch('selectedSources', function(selectedSources) {
  	if(selectedSources) {
  		var sources = selectedSources.map(function(el) { return el.name });
      $location.search('sources', sources.toString());
  	}
  }, true);

  $scope.setQuery = function() {
    $location.search('keyword', $scope.keyword.value);
  	// $location.search(angular.extend($location.search(), { keyword: $scope.keyword.value }));
  }

  $scope.clearChart = function() {
    $scope.selectedSources = [];
    $scope.keyword.value = null;
    $scope.loadedSources = [];
    $location.search({});
  }


  function createParamsObj(source) {
  	if(source.name === 'Todas') {
      var array = source.value.split(',');
      var index = array.indexOf('Meios & Publicidade');
      array.splice(index, 1);
      var value = array.join(',');
  		return {beginDate: $scope.since, endDate: $scope.until, timeFrame: timeFrame, q: $scope.keyword.value, source: value};
  	} else {
			return {beginDate: $scope.since, endDate: $scope.until, timeFrame: timeFrame, q: $scope.keyword.value, source: source.name};
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
          xsObj[countId] = timeId;
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
          console.log($scope.sapoData);
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