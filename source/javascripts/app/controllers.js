'use strict';

var mediavizControllers = angular.module('mediavizControllers', []);

mediavizControllers.controller('SourceSelectCtrl', function($rootScope, $scope, $location) {

	var rootPath = '/'

	$rootScope.loadSource = function(sourceObj) {
		$rootScope.selectedSource = sourceObj;
		$location.search('');
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

mediavizControllers.controller('ChronicleCtrl', function($scope, $location, $routeParams, Resources, Chart) {

	var chart, keyword;

	var count = 0;

	$scope.keyword = '';

	$scope.setKeyword = function() {
		getTotalsAndDraw();
	}

	$scope.clearChart = function() {
		chart.unload();
		// $('#keyword-chart').html('');
		// count = 0;
	}

	function getTotalsAndDraw() {
			keyword = $scope.keyword;
			var timeId = 'timeFor' + keyword;
			var countId = keyword;
			var xsObj = {};
			xsObj[countId] = timeId;
			Resources.get({resource: 'totals', q: $scope.keyword}).$promise.then(function(dataObj) {
				var formattedData = formatData(dataObj, keyword);
				if(count === 0) {
					keywordChart.options.data.xs = xsObj;
					keywordChart.options.data.columns = formattedData;
					chart = Chart.draw(keywordChart);
					count += 1;
				} else if (count >= 1) {
					chart.load({
						xs: xsObj,
						columns: formattedData
					});
				}
			});
	};

	function formatData(data, keyword) {
		var columns = [];
		var timeCol = [];
		var valueCol = [];
		angular.forEach(data, function(datum) {
			timeCol.push(datum.time);
			valueCol.push(datum.articles);
		});
		timeCol.unshift('timeFor' + keyword);
		valueCol.unshift(keyword);
		columns.push(timeCol, valueCol);
		return columns;
	}

	var patterns = {
    light: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896'],
    dark: ['#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7'],
    material: ['#e51c23', '#673ab7', '#5677fc', '#03a9f4', '#00bcd4', '#259b24', '#ffeb3b', '#ff9800']
  };

	var keywordChart = {
		options: {
			bindto: '#keyword-chart',
			size: {
        height: 500
    	},
    	legend: {
    		position: 'right'
    	},
			data: {
				type: 'line',
				onclick: function (d, i) { console.log("onclick", d); }
			},
			subchart: {
				show: true
			},
			axis: {
				x: {
					label: {
						text: 'Dias',
						position: 'outer-center'
					},
					type: 'timeseries',
					tick: {
						culling: {
              max: 10 // the number of tick texts will be adjusted to less than this value
            },
						format: '%d %b'
					}
				},
				y: {
					padding: {top: 10, bottom: 5},
					label: {
						text: 'Artigos',
						position: 'outer-middle'
					}
				}
			},
			color: {
				pattern: patterns.material
			}
		}
	}

});

mediavizControllers.controller('DashboardCtrl', function($scope, $location, $q, $routeParams, Resources, Chart) {

	$scope.query = $routeParams.q;
	$scope.since = $routeParams.since;
	$scope.until = $routeParams.until;
	$scope.category = $routeParams.category;

	// Set a default start date if none is passed
	$scope.startDate = $scope.since ? $scope.since : '2014-10-16';

	var chart1, chart2;

	$scope.loading = {
		chart1: true,
		chart2: true
	}

	var sourceName;

	if($location.path() === '/') {
		sourceName = 'All'
	} else {
		sourceName = $routeParams.source;
	}


	getItems().then(function() {
		getTotalsAndDraw().then(function() {
			getSourceData().then(function() {
			});
		});
	});

	// Get the source data for the selected source

	function getSourceData() {
		var deferred = $q.defer();
		deferred.resolve(
			Resources.get({resource: 'sources', name: sourceName}).$promise.then(function(obj) {
				$scope.allData = obj;
				$scope.categories = $scope.allData[0].categories;
				// chart2_opts.options.data.json = obj;
				// chart2 = Chart.draw(chart2_opts);
				// $scope.loading.chart2 = false;
			})
		);
		return deferred.promise;
	}

	function getTotalsAndDraw() {
		var deferred = $q.defer();
		if(sourceName === 'All') {
			deferred.resolve(
				Resources.get({resource: 'totals', since: $scope.startDate, until: $scope.until, q: $scope.query, by: $scope.selectedTime, category: $scope.category }).$promise.then(function(obj) {
					$scope.sourceData = obj;
					var twitterShareSum = 0;
					var facebookShareSum = 0;
					angular.forEach(obj, function(el) {
						twitterShareSum += el.twitter_shares;
						facebookShareSum += el.facebook_shares;
					});
					var shareCountObj = [{twitter_shares: twitterShareSum, facebook_shares: facebookShareSum}];
					chart1_opts.options.data.json = obj;
					chart1 = Chart.draw(chart1_opts);
					$scope.loading.chart1 = false;
					chart2_opts.options.data.json = shareCountObj;
					chart2 = Chart.draw(chart2_opts);
					$scope.loading.chart2 = false;					
				})
			);	
		} else {
			deferred.resolve(
			Resources.get({resource: 'totals', source: sourceName, since: $scope.startDate, until: $scope.until, q: $scope.query, by: $scope.selectedTime, category: $scope.category }).$promise.then(function(obj) {
				$scope.sourceData = obj;
				var twitterShareSum = 0;
				var facebookShareSum = 0;
				angular.forEach(obj, function(el) {
					twitterShareSum += el.twitter_shares;
					facebookShareSum += el.facebook_shares;
				});
				var shareCountObj = [{twitter_shares: twitterShareSum, facebook_shares: facebookShareSum}];
				chart1_opts.options.data.json = obj;
				chart1 = Chart.draw(chart1_opts);
				$scope.loading.chart1 = false;
				chart2_opts.options.data.json = shareCountObj;
				chart2 = Chart.draw(chart2_opts);
				$scope.loading.chart2 = false;
			})
			);
		}
		return deferred.promise;
	}

	function getItems() {
		var deferred = $q.defer();
		if(sourceName === 'All') {
			deferred.resolve(
			Resources.get({resource: 'items', since: $scope.startDate, until: $scope.until, q: $scope.query, by: $scope.selectedTime, category: $scope.category }).$promise.then(function(obj) {
					$scope.itemsData = obj;
					//chart1_opts.options.data.json = obj;
					//chart1 = Chart.draw(chart1_opts);
					//$scope.loading.chart1 = false;
				})
			);
		} else {
			deferred.resolve(
			Resources.get({resource: 'items', source: sourceName, since: $scope.startDate, until: $scope.until, q: $scope.query, by: $scope.selectedTime, category: $scope.category }).$promise.then(function(obj) {
					$scope.itemsData = obj;
					//chart1_opts.options.data.json = obj;
					//chart1 = Chart.draw(chart1_opts);
					//$scope.loading.chart1 = false;
				})
			);			
		}
		return deferred.promise;
	}

	$scope.setParams = function() {
		var params = {};
		if($scope.since) {
			params['since'] = $scope.since;
		}
		if($scope.until) {
			params['until'] = $scope.until;
		}
		if($scope.query) {
			params['q'] = $scope.query;
		}
		if($scope.category) {
			params['category'] = $scope.category;
		}
		$location.search(params);	
	}

	$scope.addCategoryToParams = function(categoryName) {
		$scope.category = categoryName;
		$scope.setParams();
	}

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
		} else {
		chart1_opts.options.axis = {
			x: {
					tick: {
						format: function(d) { return d; }
					}
				}
			}
		}
		getTotalsAndDraw();
	}

	// Tag cloud stuff

	$scope.tagLimit = 50;

	$scope.tagClasses = ['small', 'medium', 'large'];

	$scope.setSizeClass = function(count) {
		var maxCount = $scope.categories[0].count;
		var index = count / maxCount * ($scope.tagClasses.length - 1);
		index = Math.round(index);
		return $scope.tagClasses[index]; 
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


