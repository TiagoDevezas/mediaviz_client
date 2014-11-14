'use strict';

var mediavizControllers = angular.module('mediavizControllers', []);

mediavizControllers.controller('SourceSelectCtrl', function($rootScope, $scope, $location) {

	var rootPath = '/'

	$rootScope.loadSource = function(sourceObj) {
		$rootScope.selectedSource = sourceObj;
		if(sourceObj.name === 'Todas') {
			if ($location.path !== rootPath) {
				$location.path(rootPath);
			} else {
				return;
			}
		} else {
			$location.path(sourceObj.name);
		}
	}
});

mediavizControllers.controller('MainCtrl', function($scope, $rootScope, SourceList) { 

	// Get the source list from the API

	if(!$rootScope.sourceList) {
		SourceList.get(function success(data) {
			$rootScope.sourceList = data;
			$rootScope.selectedSource = $rootScope.sourceList[0];	
		});
	} else {
		$rootScope.selectedSource = $rootScope.sourceList[0];	
	}
	
});

mediavizControllers.controller('SourceCtrl', function($rootScope, $scope, $routeParams, SourceList) {

	var currentSource = $routeParams.source;

	function getCurrentSourceFromList(sourceName) {
		var obj = {};
		angular.forEach($rootScope.sourceList, function(el) {
			if(el.name === sourceName) {
				obj = el;
			}
		});
		return obj;
	}

	// Only get the source list from the API if it's empty

	if(!$rootScope.sourceList) {
		SourceList.get(function success(data) {
			$rootScope.sourceList = data;
			var sourceObj = getCurrentSourceFromList(currentSource);
			$rootScope.selectedSource = getCurrentSourceFromList(currentSource);		
		});
	}

});

mediavizControllers.controller('DashboardCtrl', function($scope, $location, $routeParams, Chart, Totals, Sources) {

	$scope.loading = {
		chart1: true,
		chart2: true
	}

	$scope.query = $routeParams.q;
	$scope.since = $routeParams.since;
	$scope.until = $routeParams.until;

	var chart1, chart2, chart3;

	$scope.startDate = $scope.since ? $scope.since : '2014-10-16';
	
	// Check the route and store the name
	var sourceName;

	if($location.path() === '/') {
		sourceName = 'All'
	} else {
		sourceName = $routeParams.source;
	}

	// Get the totals data for the selected source
	
	if(sourceName === 'All') {
		Totals.get({since: $scope.startDate, until: $scope.until, q: $scope.query}).$promise.then(function(obj) {
			$scope.sourceData = obj;
			chart1_opts.options.data.json = obj;
			chart1 = Chart.draw(chart1_opts);
			$scope.loading.chart1 = false;
		});
	} else {
		Totals.get({source: sourceName, since: $scope.startDate, until: $scope.until, q: $scope.query, by: $scope.selectedTime }).$promise.then(function(obj) {
			$scope.sourceData = obj;
			chart1_opts.options.data.json = obj;
			chart1 = Chart.draw(chart1_opts);
			$scope.loading.chart1 = false;
		});
	}

	function getTotalsAndDraw() {
		if(sourceName === 'All') {
			Totals.get({since: $scope.startDate, until: $scope.until, q: $scope.query, by: $scope.selectedTime }).$promise.then(function(obj) {
				$scope.sourceData = obj;
				chart1_opts.options.data.json = obj;
				chart1 = Chart.draw(chart1_opts);
				$scope.loading.chart1 = false;
			});	
		} else {
			Totals.get({source: sourceName, since: $scope.startDate, until: $scope.until, q: $scope.query, by: $scope.selectedTime }).$promise.then(function(obj) {
				$scope.sourceData = obj;
				chart1_opts.options.data.json = obj;
				chart1 = Chart.draw(chart1_opts);
				$scope.loading.chart1 = false;
			});
		}	
	}

	// Get the source data for the selected source

	Sources.get({name: sourceName}).$promise.then(function(obj) {
		$scope.allData = obj;
		chart2_opts.options.data.json = obj;
		chart2 = Chart.draw(chart2_opts);
		$scope.loading.chart2 = false;
	});

	// Set the default time period

	$scope.selectedTime = $scope.selectedTime || 'day';

	$scope.changeTime = function(){
		$scope.loading.chart1 = true;
		if($scope.selectedTime === 'day') {
			chart1_opts.options.axis = {
				x: {
					type: 'timeseries',
					tick: {
						format: '%d %b'
					}
				}
			}
			getTotalsAndDraw();
		} else {
		chart1_opts.options.axis = {
			x: {
					tick: {
						format: function(d) { return d; }
					}
				}
			}
		getTotalsAndDraw();
		}
	}

	$scope.twitterLoaded = false;
	$scope.facebookLoaded = false;

	$scope.loadData = function(dataToLoad) {
		if(dataToLoad === 'twitter' && $scope.twitterLoaded) {
			chart1.load({
				json: $scope.sourceData,
				keys: {
					//x: 'time',
					value: ['twitter_shares']
				},
				types: {
					twitter_shares: 'area'
				}
			});
			chart2.unload({
				ids: 'facebook_shares'
			});
			$scope.twitterLoaded != $scope.twitterLoaded;
		} 
		if ($scope.twitterLoaded === false) {
			chart1.unload({
				ids: 'twitter_shares'
			});
			chart2.load({
				json: $scope.allData,
				keys: {
					value: ['facebook_shares']
				}
			});
			$scope.twitterLoaded === false;
		}
		if (dataToLoad === 'facebook' && $scope.facebookLoaded) {
			chart1.load({
				json: $scope.sourceData,
				keys: {
					//x: 'time',
					value: ['facebook_shares']
				},
				types: {
					facebook_shares: 'area'
				}
			});		
			$scope.facebookLoaded != $scope.facebookLoaded;	
		}
		if (!$scope.facebookLoaded) {
			chart1.unload({
				ids: 'facebook_shares'
			});
			$scope.facebookLoaded != $scope.facebookLoaded;
		}
	}

	var patterns = {
    light: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896'],
    dark: ['#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7'],
    material: ['#e51c23', '#673ab7', '#5677fc', '#03a9f4', '#00bcd4', '#259b24', '#ffeb3b', '#ff9800']
  };

	var chart1_opts = {
		options: {
			bindto: '.chart',
			data: {
				json: '',
				keys: {
					x: 'time',
					value: ['time', 'articles']
				},
				types: {
					articles: 'area'
				},
				onclick: function (d, i) { console.log("onclick", d); }
			},
			subchart: {
				show: true
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%d %b'
					}
				}
			},
			color: {
				pattern: patterns.material
			}
		}
	}

	var chart2_opts = {
		options: {
			bindto: '.chart2',
			data: {
				json: '',
				keys: {
					value: ['twitter_shares', 'facebook_shares']
				},
				type: 'pie',
			},
			color: {
				pattern : patterns.material
			},
			pie: {
				label: {
					format: function(d) {
						return d;
					}
				}				
			}
		}
	}

});


