mediavizControllers.controller('SourcesCtrl', function($scope, $location, $filter, Page, SAPONews) {

  Page.setTitle('Fontes');

  $scope.selectedSources = [];
  $scope.loadedSources = [];

  // Location watcher

  $scope.$watch(function() { return $location.search() }, function(locationObj, oldVal) {
  	if(locationObj) {
	  	var sources = locationObj['sources'];
	  	if(sources) {
	  		sources = sources.length === 1 ? sources : sources.split(',');
	  		sources = d3.set(sources).values();
	  		$scope.selectedSources = sources.map(function(el) { return { name: el } });
	  		$scope.loadedSources = [];
	  		getSourceData();
	  	}
  	}

  }, true);

  function createParamsObj(source) {
  	if(source.name === 'Todas') {
  		return {beginDate: '2015-01-01', endDate: '2015-05-31', timeFrame: 'DAY', q: 'portugal', source: source.value};
  	} else {
			return {beginDate: '2015-01-01', endDate: '2015-05-31', timeFrame: 'DAY', q: 'portugal', source: source.name};
		}
  }

  var params = {beginDate: '2015-01-01', endDate: '2015-05-31', timeFrame: 'DAY', q: 'portugal'}

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
  				$scope.xsObj = xsObj;
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
            format: '%d %b'
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