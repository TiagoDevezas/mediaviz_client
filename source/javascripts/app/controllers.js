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

mediavizControllers.controller('ChronicleCtrl', function($scope, $rootScope, $location, $routeParams, $timeout, Resources, Chart) {

	var chart;

	var count = 0;

	$scope.chartCleared = false;

	var selectedQueries = [
		['fc porto', 'benfica', 'sporting'],
		['ébola', 'legionella'],
		['sócrates'],
		['passos coelho', 'antónio costa'],
		['défice', 'dívida']
	];

	$rootScope.keywordParams = [];

	showPredefinedQuery();

	// Select a query from the list and draw the chart

	function showPredefinedQuery() {
		if(!$location.search()['keyword'] && !$scope.chartCleared) {
			var selectedQueryIndex = Math.floor(Math.random() * (selectedQueries.length));
			$rootScope.keywordParams = selectedQueries[selectedQueryIndex];
			$location.search({keyword: $rootScope.keywordParams.toString()});
			//getTotalsAndDraw();
		}
	}

	if($location.search()['keyword']) {
		if($location.search()['keyword'].split(',').length > -1) {
			$rootScope.keywordParams = $location.search()['keyword'].split(',').map(function(kw) {
				var cleanKeyword = kw.trim();
				return cleanKeyword;
			});
		} else {
			$rootScope.keywordParams.push($location.search()['keyword']);
		}
	} else {
		$rootScope.keywordParams = [];
	}
	
	if($rootScope.keywordParams) {
		getTotalsAndDraw();
	}


	$scope.$on('$locationChangeSuccess', function(){

			console.log('location changed successfully');

			if($location.search()['keyword']) {
				if($location.search()['keyword'].toString() !== $rootScope.keywordParams.toString()) {
					if(chart) { chart.unload() }
				}
				if($location.search()['keyword'].split(',').length > -1) {
					$rootScope.keywordParams = $location.search()['keyword'].split(',').map(function(kw) {
						var cleanKeyword = kw.trim();
						return cleanKeyword;
					});
					console.log($rootScope.keywordParams);
				} else {
					$rootScope.keywordParams.push($location.search()['keyword']);
				}
			} 
			else {
				showPredefinedQuery();
				//$rootScope.keywordParams = [];
				//if(chart) { chart.destroy(); }
			}

			getTotalsAndDraw();

	});


	$scope.setKeyword = function(keyword) {
		//$rootScope.keywordParams.unshift(keyword);
		// check if value is in keywordParams array
		if($rootScope.keywordParams.indexOf(keyword) === -1) {
			// add to array
			$rootScope.keywordParams.push(keyword);
			$location.search({keyword: $rootScope.keywordParams.toString()});
			//getTotalsAndDraw();
		} else {
			alert('Palavra já pesquisada');
		}

		// $rootScope.keywords.unshift(keyword);
		// var newKeywords = $rootScope.keywords.map(function(el) {
		// 	return el;
		// });
		// keywordString = newKeywords.reverse().join('.');
		// $location.search({keyword: keywordString});
		// $scope.keywordParams = $location.search()['keyword'].split('.');
	}

	$scope.clearChart = function() {
		//$rootScope.keywordParams = [];
		count = 0;
		$location.search('');
		$rootScope.keywordParams = [];
		$scope.chartCleared = true;
		//$scope.$apply();
		if(chart) { chart.destroy(); }
	}

	//$scope.keywordParams = {};
	//$scope.keywordParams['keywords'] = $scope.keywords;

	function getTotalsAndDraw() {
		// Get data for each keyword
		angular.forEach($rootScope.keywordParams, function(el, index) {
			var keyword = el;
			var timeId = 'timeFor' + keyword;
			var countId = keyword;
			var xsObj = {};
			xsObj[countId] = timeId;
			Resources.get({resource: 'totals', q: keyword}).$promise.then(function(dataObj) {
				var formattedData = formatData(dataObj, keyword);
				if(index === 0) {
					keywordChart.options.data.xs = xsObj;
					keywordChart.options.data.columns = formattedData;
					chart = Chart.draw(keywordChart);
					count += 1;
				} else {
					chart.load({
						xs: xsObj,
						columns: formattedData
					});
				}
			});

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

	function getItemData(datum) {
		var dateFormat = d3.time.format("%Y-%m-%d");
		var unformattedDate = datum.x;
		var formattedDate = dateFormat(unformattedDate);
		var query = datum.name;
		displayItems(formattedDate, query);
	}

	function displayItems(date1, query) {
		$location.path('/chronicle/items').search({q: query, since: date1, until: date1});
		$scope.$apply();
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
			tooltip: {
        grouped: false 
	    },
			data: {
				type: 'line',
				onclick: function (d, i) { getItemData(d) }
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
			color: function(d) {
				return d3.scale.category20c(d);
			}
		}
	}

});

mediavizControllers.controller('ChronicleItemsCtrl', function($scope, $location, $routeParams, Resources) {
	$scope.q = $routeParams.q;
	$scope.since = $routeParams.since;
	$scope.until = $routeParams.until;
	$scope.limit = $routeParams.limit || 50;

	$scope.sourceFilter = '';

	Resources.get({resource: 'items', q: $scope.q, since: $scope.since, until: $scope.until, limit: $scope.limit}).$promise.then(function(dataObj) {
		// using rootScope is bad practice, extract to service
		$scope.chronicleItems = dataObj;
		console.log(dataObj);
		//$location.path('/chronicle/items');
	});

});

mediavizControllers.controller('FlowCtrl', function($scope, $location, $routeParams, Resources, SourceList, Chart) {
	$scope.sourceList = [];
	$scope.selectedSources = {};
	$scope.selectedSources.selected = [];
	$scope.by = $routeParams.by || 'hour';
	$scope.since = $routeParams.since || '2014-11-01';
	$scope.sourceData = [];
	$scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since};

	$scope.loadedSources = [];

	var chart;
	
	if($scope.sourceList.length === 0) {
		SourceList.get(function(data) {
			$scope.sourceList = data;
			//$scope.selectedSource = $scope.sourceList[0];
			$scope.selectedSources.selected.push($scope.sourceList[0]);
			//getTotalsAndDraw();
		});
	} else {
		$scope.selectedSources.selected.push($scope.sourceList[0]);	
	}

	$scope.groupSourcesByType = function(item) {
		if(item.type === 'newspaper') {
			return 'Jornais';
		}
		if(item.type === 'blog') {
			return 'Blogues';
		}
	}

	$scope.displayBy = function(timePeriod) {
		if(timePeriod === 'hour') {
			$scope.by = 'hour';
			if(chart) { chart.unload(); }
			$scope.loadedSources = [];
			getTotalsAndDraw();
		}
		if(timePeriod === 'day') {
			$scope.by = 'day';
			if(chart) { chart.unload(); }
			$scope.loadedSources = [];
			getTotalsAndDraw();
		}
	}

	$scope.loadSourceData = function(selectedSources) {
		getTotalsAndDraw();
	}

	$scope.$watch('selectedSources.selected', function(newVal, oldVal) {
		var sourceToRemove, sourceToRemoveIndex;
		if(newVal.length < oldVal.length) {
			angular.forEach(oldVal, function(obj) {
				if(newVal.indexOf(obj) === -1) {
					sourceToRemove = obj.name;
				}
			});
			sourceToRemoveIndex = $scope.loadedSources.indexOf(sourceToRemove)
			chart.unload({ids: sourceToRemove});
			$scope.loadedSources.splice(sourceToRemoveIndex, 1);
		}
	});

	// Extract to service
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

	function getTotalsAndDraw() {
		angular.forEach($scope.selectedSources.selected, function(el, index) {

			var keyword = el.name;
			var timeId = 'timeFor' + keyword;
			var countId = keyword;
			var xsObj = {};
			xsObj[countId] = timeId;

			if(keyword !== 'Todas') {
				$scope.paramsObj = {resource: 'totals', by: $scope.by, source: keyword};
			} else {
				$scope.paramsObj = {resource: 'totals', by: $scope.by};
			}

			if($scope.loadedSources.indexOf(keyword) === -1) {
				Resources.get($scope.paramsObj).$promise.then(function(data) {
					var formattedData = formatData(data, keyword);
					$scope.loadedSources.push(keyword);
					if(index === 0) {
						timeChart.options.data.xs = xsObj;
						timeChart.options.data.type = 'area';
						timeChart.options.axis.x.type = '';
						timeChart.options.data.columns = formattedData;
						timeChart.options.data.groups = [$scope.loadedSources];
						if($scope.by === 'day') {
							timeChart.options.axis.x.type = 'timeseries';
							timeChart.options.axis.x.label.text = 'Dias';
							timeChart.options.axis.x.tick.format = '%d %b';
							timeChart.options.data.type = 'area-spline';
							timeChart.options.data.groups = [];
						}
						chart = Chart.draw(timeChart);
					} else {
						chart.load({
							xs: xsObj,
							columns: formattedData
						});
					}
				});				
			}


		});		
	}

	var timeChart = {
		options: {
			bindto: '#time-chart',
			size: {
        height: 500
    	},
    	legend: {
    		position: 'right'
    	},
			tooltip: {
        grouped: false 
	    },
			data: {
				type: 'area',
				//onclick: function (d, i) { getItemData(d) }
			},
			subchart: {
				show: true
			},
			axis: {
				x: {
					padding: {left: 0, right: 0},
					label: {
						text: 'Horas',
						position: 'outer-center'
					},
					tick: {
						culling: {
              max: 12 // the number of tick texts will be adjusted to less than this value
            },
						format: function(d, i) {
								var d = d < 10 ? '0' + d : d
								return d + ':00';
						}
					}
				},
				y: {
					padding: {top: 1, bottom: 1},
					min: 0,
					label: {
						text: 'Artigos',
						position: 'outer-middle'
					}
				}
			},
			color: function(d) {
				return d3.scale.category20c(d);
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


