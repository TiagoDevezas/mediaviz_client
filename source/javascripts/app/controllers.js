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

mediavizControllers.controller('MainCtrl', function($scope, $rootScope, $location, SourceList, Chart, Sources, Totals) { 

	// Get the source list from the API

	if(!$rootScope.sourceList) {
		SourceList.get(function success(data) {
			$rootScope.sourceList = data;
			// On the root path, select the first source ('All')
			$rootScope.selectedSource = $rootScope.sourceList[0];		
		});
	}

	$scope.loadData = function(dataToLoad) {
		if(dataToLoad === 'twitter') {
			$scope.chart1.load({
				json: $scope.sourceData,
				keys: {
					//x: 'time',
					value: ['time', 'twitter_shares']
				},
				types: {
					twitter_shares: 'area'
				}
			});
		} else if (dataToLoad === 'facebook') {
			$scope.chart1.load({
				json: $scope.sourceData,
				keys: {
					//x: 'time',
					value: ['time', 'facebook_shares']
				},
				types: {
					facebook_shares: 'area'
				}
			});			
		}
	}

	// Get the data for all sources

	Totals.get({since: '2014-10-20'}).$promise.then(function(obj) {
		$scope.sourceData = obj;
		chart1.options.data.json = obj;
		$scope.chart1 = Chart.draw(chart1);
		console.log($scope.chart1);
	});

	var chart1 = {
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
				}
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
				pattern: ['#e51c23', '#673ab7', '#5677fc', '#03a9f4', '#00bcd4', '#259b24', '#ffeb3b', '#ff9800']
			}
		}
	}
	
});

mediavizControllers.controller('SourceCtrl', function($rootScope, $scope, $routeParams, Totals, Chart, SourceList) {

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

	Totals.get({source: currentSource, since: '2014-10-20'}).$promise.then(function(obj) {
		$scope.sourceData = obj;
		chart1.options.data.json = obj;
		Chart.draw(chart1);
	});

	var chart1 = {
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
				}
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%d %b'
					}
				}
			}
		}
	}

});


