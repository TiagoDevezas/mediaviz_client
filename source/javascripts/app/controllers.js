'use strict';

var mediavizControllers = angular.module('mediavizControllers', []);

mediavizControllers.controller('RootCtrl', function($scope, SourceList) {

	$scope.sourceList = [];
	$scope.selectedSources = {};
	$scope.selectedSources.selected = [];


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

});

mediavizControllers.controller('HomeCtrl', function($scope, $location) {

	$scope.selectedSources = {};
	$scope.selectedSources.selected = [];

	$scope.goToSourcePage = function(source, model) {
		$location.path('/source/' + source.name);
	}

	$scope.groupSourcesByType = function(item) {
		if(item.type === 'newspaper') {
			return 'Jornais Nacionais';
		}
		if(item.type === 'international') {
			return 'Jornais Internacionais';
		}
		if(item.type === 'blog') {
			return 'Blogues';
		}
	}



});

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

mediavizControllers.controller('SourceCtrl', function($scope, $routeParams, Resources, Chart, DataFormatter) {

	$scope.sourceName = $routeParams.name;
	$scope.loading = false;

	$scope.since = '2014-10-15' || $routeParams.since;
	$scope.until;

	var chart;

	var resourceParams = {resource: 'totals', since: $scope.since, source: $scope.sourceName}

	if($scope.sourceName === 'Todas') {
		resourceParams = {resource: 'totals', since: $scope.since};
	}

	getTotalsAndDraw();

	function getTotalsAndDraw() {
		Resources.get(resourceParams).$promise.then(function(data) {
			var formattedData = DataFormatter.inColumns(data, $scope.sourceName, 'time', 'articles');
			timeChart.options.data.columns = formattedData;
			timeChart.options.data.x = 'timeFor' + $scope.sourceName;
			chart = Chart.draw(timeChart);
		});
	};

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
			point: {
				r: 1.5
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

	// var currentSource = $routeParams.source;

	// function getCurrentSourceFromList(sourceName) {
	// 	var obj = {};
	// 	angular.forEach($rootScope.sourceList, function(el) {
	// 		if(el.name === sourceName) {
	// 			obj = el;
	// 		}
	// 	});
	// 	return obj;
	// }

	// // Only get the source list from the API if it's empty

	// if(!$rootScope.sourceList) {
	// 	SourceList.get(function success(data) {
	// 		$rootScope.sourceList = data;
	// 		var sourceObj = getCurrentSourceFromList(currentSource);
	// 		$rootScope.selectedSource = getCurrentSourceFromList(currentSource);		
	// 	});
	// }

});

mediavizControllers.controller('ChronicleCtrl', function($scope, $rootScope, $location, $routeParams, $timeout, Resources, Chart, DataFormatter) {

	var chart;

	var count = 0;

	$scope.loadedSources = [];

	$scope.loading = false;

	$scope.chartCleared = false;

	$scope.sourceType = 'newspaper';

	$scope.since = '2014-10-15' || $routeParams.since;
	$scope.until;

	$scope.dataFormat = 'absolute';

	// $scope.$watch('dataFormat', function(newVal, oldVal) {
	// 	var newLocation = angular.extend($location.search(), {format: $scope.dataFormat});
	// 	$location.search(newLocation);
	// });

	// $scope.$watch(function() { return $location.search()['format'] }, function() {
	// 	$scope.setDataFormat($location.search()['format']);	
	// }, true);

	var selectedQueries = [
		['fc porto', 'benfica', 'sporting'],
		['ébola', 'legionella'],
		['passos coelho', 'antónio costa'],
		['défice', 'dívida'],
		['ricardo salgado', 'bes'],
		['sócrates', 'miguel macedo', 'duarte lima']
	];

	$scope.keywords = {};
	$scope.keywords.selected = [];

	//$rootScope.keywordParams = [];

	showPredefinedQuery();

	function showPredefinedQuery() {
		if ($scope.keywords.selected.length === 0) {
			var selectedQueryIndex = Math.floor(Math.random() * (selectedQueries.length));
			$scope.keywords.selected = selectedQueries[selectedQueryIndex].map(function(el) {
				return el;
			});
			//$location.search({ keywords: $scope.keywords.selected.toString() });
			//getTotalsAndDraw();
		}
	}

	function objectIsEmpty(obj) {
		Object.keys(obj).length > 0 ? false : true;
	}

	$scope.$watch(function() { return $location.search() }, function() {
		console.log($location.search())
		if(!objectIsEmpty($location.search())) {
			var keywordArray = [];
			if($location.search()['keywords'].length === 1)
				keywordArray = $location.search()['keywords'];
			else if ($location.search()['keywords'].length > 1) {
				var keywordArray = $location.search()['keywords'].split(',');				
			}
			$scope.keywords.selected = keywordArray;
		}
		else {
			$scope.clearChart();
		} 
		//$scope.setDataFormat($location.search()['format']);	
	}, true);

	$scope.$watch('keywords.selected', function(newVal, oldVal) {
		console.log(newVal, oldVal);
		if(newVal.length !== 0) {
			$location.search({keywords: newVal.toString()});
			getTotalsAndDraw();
		} else {
			$location.search('');
		}
	});

	$scope.clearChart = function() {
		//$rootScope.keywordParams = [];
		//$location.search('');
		$scope.keywords.selected = [];
		$scope.loadedSources = [];
		$scope.chartCleared = true;
		//$scope.keyword = '';
		//$scope.$apply();
		if(chart) { chart.unload(); }
	}

	$scope.setDataFormat = function(dataFormat){
		if ($scope.dataFormat !== dataFormat) {
			$scope.dataFormat = dataFormat;
			$scope.loadedSources = [];
			chart.flush();
			getTotalsAndDraw();
		}
	}

	$scope.setSourceType = function(sourceType){
		if ($scope.sourceType !== sourceType) {
			$scope.sourceType = sourceType;
			$scope.loadedSources = [];
			getTotalsAndDraw();
		}
	}

	$scope.addKeyword = function(item){
		$scope.keywords.selected.push(item);
		//$location.search({ keywords: $scope.keywords.selected.toString() });
		//getTotalsAndDraw();
	}

	$scope.removeKeyword = function(item) {
		$scope.keywords.selected.splice($scope.keywords.selected.indexOf(item), 1);
		$scope.loadedSources.splice($scope.loadedSources.indexOf(item), 1);
		//$location.search({ keywords: $scope.keywords.selected.toString() });
		chart.unload({ ids: item });
	}

	function getTotalsAndDraw() {
		angular.forEach($scope.keywords.selected, function(el, index) {
			var keyword = el;
			var timeId = 'timeFor' + keyword;
			var countId = keyword;
			var xsObj = {};
			if($scope.loadedSources.indexOf(keyword) === -1) {
				$scope.loading = true;
				Resources.get({resource: 'totals', q: keyword, since: $scope.since, type: $scope.sourceType}).$promise.then(function(dataObj) {
					if(dataObj.length > 0) {
						var formattedData;
						xsObj[countId] = timeId;
						$scope.loading = false;
						$scope.loadedSources.push(keyword);
						if($scope.dataFormat === 'absolute') {
							formattedData = DataFormatter.inColumns(dataObj, keyword, 'time', 'articles');
							keywordChart.options.axis.y.label.text = 'Número de artigos';
						}
						if($scope.dataFormat === 'relative') {
							formattedData = DataFormatter.inColumns(dataObj, keyword, 'time', 'percent');
							keywordChart.options.axis.y.label.text = 'Percentagem do total de artigos';
						}
						if(!chart) {
							keywordChart.options.data.xs = xsObj;
							keywordChart.options.data.columns = formattedData;
							chart = Chart.draw(keywordChart);
						} else {
							chart.load({
								xs: xsObj,
								columns: formattedData
							});
						}
					} else {
						$scope.loading = false;
						$timeout(function() {
							chart.unload({ids: keyword});
						}, 500)
						//alert($scope.loadedSources);
					}
				});
			}
		});
	};

	if($rootScope.keywordParams) {
		getTotalsAndDraw();
	}

	function getItemData(datum) {
		var dateFormat = d3.time.format("%Y-%m-%d");
		var unformattedDate = datum.x;
		var formattedDate = dateFormat(unformattedDate);
		var query = datum.name;
		displayItems(formattedDate, query, $scope.sourceType);
	}

	function displayItems(date1, query, sourceType) {
		$location.path('/chronicle/items').search({q: query, since: date1, until: date1, type: sourceType });
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
				type: 'area',
				onclick: function (d, i) { getItemData(d) }
			},
			point: {
				r: 1.5
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
					//padding: {top: 10, bottom: 5},
					label: {
						text: '',
						position: 'outer-middle'
					},
					tick: {
						format: function(d) {
							return d;
						}
					}
				}
			},
			tooltip: {
				format: {
					value: function(value, ratio, id) {
						if($scope.dataFormat === 'relative') {
							return value + '% de todos os artigos publicados nesta data';
						}
						if($scope.dataFormat === 'absolute') {
							return value;
						}
					}
				}
			},
			color: function(d) {
				return d3.scale.category20c(d);
			}
		}
	}

});

mediavizControllers.controller('ChronicleItemsCtrl', function($scope, $location, $routeParams, Resources, Chart) {
	$scope.q = $routeParams.q;
	$scope.since = $routeParams.since;
	$scope.until = $routeParams.until;
	$scope.limit = $routeParams.limit || 50;
	$scope.sourceType = $routeParams.type;

	$scope.loading = true;

	$scope.sourceFilter = '';

	Resources.get({resource: 'items', q: $scope.q, since: $scope.since, until: $scope.until, limit: $scope.limit, type: $scope.sourceType}).$promise.then(function(dataObj) {
		$scope.loading = false;
		$scope.chronicleItems = dataObj;
		//console.log(dataObj);
		//$location.path('/chronicle/items');
	});

});

mediavizControllers.controller('FlowCtrl', function($scope, $location, $routeParams, Resources, SourceList, Chart, DataFormatter) {
	// $scope.sourceList = [];
	// $scope.selectedSources = {};
	// $scope.selectedSources.selected = [];
	$scope.type = 'newspaper';
	$scope.by = $routeParams.by || 'hour';
	$scope.since = $routeParams.since;
	$scope.until = $routeParams.until;
	$scope.sourceData = [];
	$scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since};

	$scope.loadedSources = [];

	$scope.showSearchTools = true;
	$scope.showSearchToolsNav = false;
	$scope.loading = false;
	var chart;

	$scope.optionsForDateSelect = [
		{name: 'Tudo'},
		{name: 'Último dia'},
		{name: 'Últimos 7 dias'},
		{name: 'Últimos 30 dias'},
		{name: 'Intervalo Personalizado'}
	];

	$scope.dateOptions = [];
	$scope.dateOptions.selected = $scope.optionsForDateSelect[0];

	$scope.today = moment().format('YYYY-MM-DD');
	$scope.yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
	$scope.oneWeekAgo = moment().subtract(7, 'day').format('YYYY-MM-DD');
	$scope.oneMonthAgo = moment().subtract(30, 'day').format('YYYY-MM-DD');

	$scope.pickadayOpen = false;
	$scope.dateSince = '';
	$scope.dateUntil = '';

	$scope.setDateInterval = function() {
		$scope.since = $scope.dateSince;
		$scope.until = $scope.dateUntil;
		$scope.pickadayOpen = false;
		$scope.loadedSources = [];
		getTotalsAndDraw();		
	}

	$scope.setSelectedOption = function(option) {
		$scope.dateOptions.selected = option;
		if(option.name === $scope.optionsForDateSelect[4].name) {
			$scope.pickadayOpen = !$scope.pickadayOpen;
		} else {
			$scope.until = $scope.today;
			if(option.name  === $scope.optionsForDateSelect[0].name) {
				$scope.since = undefined;
			}
			if(option.name  === $scope.optionsForDateSelect[1].name) {
				$scope.since = $scope.yesterday;
			}
			if(option.name  === $scope.optionsForDateSelect[2].name) {
				$scope.since = $scope.oneWeekAgo;
			}
			if(option.name  === $scope.optionsForDateSelect[3].name) {
				$scope.since = $scope.oneMonthAgo;
			}

			$scope.pickadayOpen = false;

			$scope.loadedSources = [];
			getTotalsAndDraw();			
		}
	}

	$scope.openSearchTools = function() {
		$scope.showSearchToolsNav = !$scope.showSearchToolsNav;
	}

	// $scope.$watch('dateOptions.selected', function(newOption, oldOption) {
	// 	if(newOption.name  !== $scope.optionsForDateSelect[4].name) {

	// 		if(newOption.name  === $scope.optionsForDateSelect[0].name) {
	// 			$scope.since = undefined;
	// 		}
	// 		if(newOption.name  === $scope.optionsForDateSelect[1].name) {
	// 			$scope.since = $scope.yesterday;
	// 		}
	// 		if(newOption.name  === $scope.optionsForDateSelect[2].name) {
	// 			$scope.since = $scope.oneWeekAgo;
	// 		}
	// 		if(newOption.name  === $scope.optionsForDateSelect[3].name) {
	// 			$scope.since = $scope.oneMonthAgo;
	// 		}

	// 		$scope.pickadayOpen = false;

	// 		$scope.loadedSources = [];
	// 		getTotalsAndDraw();
	// 	}
	// });
	
	// if($scope.sourceList.length === 0) {
	// 	SourceList.get(function(data) {
	// 		$scope.sourceList = data;
	// 		//$scope.selectedSource = $scope.sourceList[0];
	// 		$scope.selectedSources.selected.push($scope.sourceList[0]);
	// 		//getTotalsAndDraw();
	// 	});
	// } else {
	// 	$scope.selectedSources.selected.push($scope.sourceList[0]);	
	// }

	$scope.groupSourcesByType = function(item) {
		if(item.type === 'newspaper') {
			return 'Jornais Nacionais';
		}
		if(item.type === 'international') {
			return 'Jornais Internacionais';
		}
		if(item.type === 'blog') {
			return 'Blogues';
		}
	}

	$scope.displayBy = function(timePeriod) {
		$scope.by = timePeriod;
		$scope.showSearchTools = true;
		if($scope.by === 'month') {
			$scope.since = undefined;
			$scope.until = undefined;
			$scope.dateOptions.selected = $scope.optionsForDateSelect[0];
			$scope.showSearchTools = false;
			$scope.showSearchToolsNav = false;
		}
		if(chart) { chart.unload(); }
		$scope.loadedSources = [];
		getTotalsAndDraw();
	}

	$scope.loadSourceData = function() {
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

	$scope.setDates = function(){
		$scope.loadedSources = [];
		getTotalsAndDraw();
	}

	function getTotalsAndDraw() {
		angular.forEach($scope.selectedSources.selected, function(el, index) {

			var keyword = el.name;
			var timeId = 'timeFor' + keyword;
			var countId = keyword;
			var xsObj = {};
			xsObj[countId] = timeId;

			if(keyword !== 'Todas') {
				$scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, source: keyword};
			} else {
				$scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, type: $scope.type};
			}

			if($scope.loadedSources.indexOf(keyword) === -1) {
				$scope.loading = true;
				Resources.get($scope.paramsObj).$promise.then(function(data) {
					$scope.loading = false;
					var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'articles');
					$scope.loadedSources.push(keyword);
					if(!chart || chart.internal.data.targets.length === 0) {
						timeChart.options.data.xs = xsObj;
						timeChart.options.data.columns = formattedData;
						if($scope.by === 'hour') {
							//timeChart.options.data.type = 'area';
							timeChart.options.axis.x.type = '';
							timeChart.options.axis.x.label.text = 'Hora';
							timeChart.options.data.groups = [$scope.loadedSources];
							timeChart.options.axis.x.tick.format = function(d, i) {
									var d = d < 10 ? '0' + d : d;
									return d + ':00';
							}
						}
						if($scope.by === 'day') {
							timeChart.options.axis.x.type = 'timeseries';
							timeChart.options.axis.x.label.text = 'Dia';
							timeChart.options.axis.x.tick.format = '%d %b';
							//timeChart.options.data.type = 'area-spline';
							timeChart.options.data.groups = [];
						}
						if($scope.by === 'month') {
							timeChart.options.axis.x.type = '';
							timeChart.options.axis.x.label.text = 'Mês';
							timeChart.options.data.groups = [$scope.loadedSources];
							timeChart.options.axis.x.tick.format = function(d, i) {
								return d;
							};
						}
						if($scope.by === 'week') {
							timeChart.options.axis.x.type = '';
							timeChart.options.axis.x.label.text = 'Dia da semana';
							timeChart.options.data.groups = [$scope.loadedSources];
							timeChart.options.axis.x.tick.format = function(d) {
								return moment().isoWeekday(d).format('ddd');
							};
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
			point: {
				r: 1.5
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
						// format: function(d, i) {
						// 		var d = d < 10 ? '0' + d : d;
						// 		return d + ':00';
						// }
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


