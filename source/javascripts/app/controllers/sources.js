mediavizControllers.controller('SourcesCtrl', function($scope, $location, $filter, $routeParams, Page, SAPONews, SourceList) {

  Page.setTitle('Fontes');

  $scope.selectedSources = [];
  $scope.loadedSources = [];

  var startDate = $routeParams.since || '2015-01-01';
  var endDate = moment().format("YYYY-MM-DD");
  var timeFrame = $routeParams.by || 'DAY';

  $scope.sourceList = SourceList.getSAPONewsList();

  $scope.query = '';

  $scope.clearChart = function() {
  	$scope.selectedSources = [];
  	$scope.loadedSources = [];
  }

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
   	var sources = $location.search()['sources'] || undefined;
   	var query = $location.search()['q'] || undefined;
  	if(sources) {
	    sources = sources.split(',');
	    var newSourcesArray = [];
	    sources.forEach(function(el) {
	    	var sourceObj = $filter('filter')($scope.sourceList, {name: el}, true)[0];
	      newSourcesArray.push(sourceObj);
	    });
	    $scope.selectedSources = newSourcesArray;
	    getSourceData();
  	} else {
  		$location.search('sources', null);
  	}
  	if(query) {
  		$scope.query = query;
  		$scope.loadedSources = [];
  		getSourceData();
  	}
  });

  $scope.$watch('selectedSources', function(newVal, oldVal) {
  	if(newVal) {
  		var sources = newVal.map(function(el) { return el.name });
  		$location.search(angular.extend($location.search(), { sources: sources.toString() }));
  	}
  }, true);

  $scope.setQuery = function(query) {
  	console.log(query);
  	if(query) {
  		$location.search(angular.extend($location.search(), { q: query }));
  	} else {
  		$location.search('q', null);
  	}
  }


  function createParamsObj(source) {
  	if(source.name === 'Todas') {
  		return {beginDate: startDate, endDate: endDate, timeFrame: timeFrame, q: $scope.query, source: source.value};
  	} else {
			return {beginDate: startDate, endDate: endDate, timeFrame: timeFrame, q: $scope.query, source: source.name};
		}
  }

  function getSourceData() {
  	$scope.selectedSources.forEach(function(source) {
			var sourceName = source.name;
  		var paramsObj = createParamsObj(source);
			var idForX = 'timeFor' + sourceName;
			var xsObj = {};
  		if($scope.loadedSources.indexOf(sourceName) === -1) {
  			SAPONews.get(paramsObj).then(function(data) {
  				$scope.loadedSources.push(sourceName);
  				xsObj[sourceName] = idForX;
  				$scope.xsObj = xsObj;
  				var dateAndCounts = data.data.facet_counts.facet_ranges.pubdate.counts;
  				var dates = dateAndCounts.map(function(el) {
  					return moment(el[0]).toDate();
  				});
  				dates.unshift(idForX);
  				var counts = dateAndCounts.map(function(el) {
  					return el[1];
  				});
  				counts.unshift(sourceName);
  				var columns = [dates, counts];
  				$scope.sapoData = columns;
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