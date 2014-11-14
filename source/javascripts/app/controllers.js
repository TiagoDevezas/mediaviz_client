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

});

mediavizControllers.controller('DashboardCtrl', function($scope, $location, $routeParams, Chart, Totals, Sources) {
	
	// Check the route and store the name
	var sourceName;

	if($location.path() === '/') {
		sourceName = 'All'
	} else {
		sourceName = $routeParams.source;
	}

	// Get the totals data for the selected source
	
	if(sourceName === 'All') {
		Totals.get({since: '2014-10-16'}).$promise.then(function(obj) {
			$scope.sourceData = obj;
			chart1.options.data.json = obj;
			$scope.chart1 = Chart.draw(chart1);
		});
	} else {
		Totals.get({source: sourceName, since: '2014-10-16'}).$promise.then(function(obj) {
			$scope.sourceData = obj;
			chart1.options.data.json = obj;
			$scope.chart1 = Chart.draw(chart1);
		});
	}

	// Get the source data for the selected source

	Sources.get({name: sourceName}).$promise.then(function(obj) {
		$scope.allData = obj;
		chart2.options.data.json = obj;
		$scope.chart2 = Chart.draw(chart2);
	});

	


	$scope.twitterLoaded = false;
	$scope.facebookLoaded = false;

	$scope.loadData = function(dataToLoad) {
		if(dataToLoad === 'twitter' && $scope.twitterLoaded === true) {
			$scope.chart1.load({
				json: $scope.sourceData,
				keys: {
					//x: 'time',
					value: ['twitter_shares']
				},
				types: {
					twitter_shares: 'area'
				}
			});
			$scope.chart2.unload({
				ids: 'facebook_shares'
			});
			$scope.twitterLoaded != $scope.twitterLoaded;
		} 
		if ($scope.twitterLoaded === false) {
			$scope.chart1.unload({
				ids: 'twitter_shares'
			});
			$scope.chart2.load({
				json: $scope.allData,
				keys: {
					value: ['facebook_shares']
				}
			});
			$scope.twitterLoaded === false;
		}
		if (dataToLoad === 'facebook' && $scope.facebookLoaded === true) {
			$scope.chart1.load({
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
		if ($scope.facebookLoaded === false) {
			$scope.chart1.unload({
				ids: 'facebook_shares'
			});
			$scope.facebookLoaded === false;
		}
	}

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
				pattern: ['#e51c23', '#673ab7', '#5677fc', '#03a9f4', '#00bcd4', '#259b24', '#ffeb3b', '#ff9800']
			}
		}
	}

	var chart2 = {
		options: {
			bindto: '.chart2',
			data: {
				json: '',
				keys: {
					value: ['twitter_shares', 'facebook_shares']
				},
				type: 'pie',
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


