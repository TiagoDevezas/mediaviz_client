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

mediavizControllers.controller('HomeCtrl', function($scope, $location, Resources, Page) {

	Page.setTitle('Início');

	$scope.selectedSources = {};
	$scope.selectedSources.selected = [];

	$scope.stats = [];
	$scope.hasData = false;

	getStats();

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

	function getStats() {
		Resources.get({resource: 'stats'}).$promise.then(function(data) {
			$scope.stats = data[0];
			$scope.hasData = true;
		});	
	}


});

mediavizControllers.controller('SourceCtrl', function($scope, $routeParams, $location, Page, Resources, Chart, DataFormatter, SourceList) {

	$scope.sourceList = [];

	$scope.currentSource = {};

	$scope.by = 'day';

	var totalsParams = {};
	var sourcesParams = {};

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

	SourceList.get(function(data) {
		$scope.sourceList = data;
		$scope.currentSource = $scope.sourceList.filter(function(obj) {
			if(obj.name === $routeParams.name)
				return obj;
		})[0];
		Page.setTitle($scope.currentSource.name);

		$scope.selectedSources.selected = $scope.currentSource;

		totalsParams = {resource: 'totals', since: $scope.since, source: $scope.currentSource.name, by: $scope.by};
		sourcesParams = {resource: 'sources', name: $scope.currentSource.name};

		if($scope.currentSource.group) {
			totalsParams = {resource: 'totals', since: $scope.since, type: $scope.currentSource.type, by: $scope.by };
			sourcesParams = {resource: 'sources', type: $scope.currentSource.type};
		}
		
		getTotalsAndDraw();
	});



	$scope.loading = false;

	$scope.since = '2014-10-15' || $routeParams.since;
	$scope.until;

	$scope.sourceData = [];

	var chart, chart2, chart3, chart4;

	$scope.dataXLength = 0;

	$scope.displayBy = function(timePeriod) {
		$scope.by = timePeriod;
		totalsParams.by = $scope.by;
		if($scope.by === 'month') {
			$scope.since = undefined;
			$scope.until = undefined;
		}
		if(chart) { chart.unload(); }
		if(chart2) { chart2.unload(); }
		if(chart3) { chart3.unload(); }
		getTotalsAndDraw();
	}

	function changeOptionsObj(objName) {
		if($scope.by === 'hour') {
			objName.options.axis.x.type = '';
			objName.options.axis.x.label.text = 'Hora';
			objName.options.axis.x.tick.format = function(d, i) {
					var d = d < 10 ? '0' + d : d;
					return d + ':00';
			}
		}
		if($scope.by === 'day') {
			objName.options.axis.x.type = 'timeseries';
			objName.options.axis.x.label.text = 'Dia';
			objName.options.axis.x.tick.format = '%d %b';
			//objName.options.data.type = 'area-spline';
		}
		if($scope.by === 'month') {
			objName.options.axis.x.type = '';
			objName.options.axis.x.label.text = 'Mês';
			objName.options.axis.x.tick.format = function(d, i) {
				return d;
			};
		}
		if($scope.by === 'week') {
			objName.options.axis.x.type = '';
			objName.options.axis.x.label.text = 'Dia da semana';
			objName.options.axis.x.tick.format = function(d) {
				return moment().isoWeekday(d).format('ddd');
			};
		}
	}

	function getTotalsAndDraw() {
		Resources.get(totalsParams).$promise.then(function(data) {
			var articleData = DataFormatter.inColumns(data, $scope.currentSource.name, 'time', 'articles');
			$scope.dataXLength = articleData[0][0].length;
			// console.log($scope.dataXLength);
			timeChart.options.data.columns = articleData;
			timeChart.options.data.x = 'timeFor' + $scope.currentSource.name;
			changeOptionsObj(timeChart);
			// if($scope.by === 'hour') {
			// 	timeChart.options.axis.x.type = '';
			// 	timeChart.options.axis.x.label.text = 'Hora';
			// 	timeChart.options.axis.x.tick.format = function(d, i) {
			// 			var d = d < 10 ? '0' + d : d;
			// 			return d + ':00';
			// 	}
			// }
			// if($scope.by === 'day') {
			// 	timeChart.options.axis.x.type = 'timeseries';
			// 	timeChart.options.axis.x.label.text = 'Dia';
			// 	timeChart.options.axis.x.tick.format = '%d %b';
			// 	//timeChart.options.data.type = 'area-spline';
			// }
			// if($scope.by === 'month') {
			// 	timeChart.options.axis.x.type = '';
			// 	timeChart.options.axis.x.label.text = 'Mês';
			// 	timeChart.options.axis.x.tick.format = function(d, i) {
			// 		return d;
			// 	};
			// }
			// if($scope.by === 'week') {
			// 	timeChart.options.axis.x.type = '';
			// 	timeChart.options.axis.x.label.text = 'Dia da semana';
			// 	timeChart.options.axis.x.tick.format = function(d) {
			// 		return moment().isoWeekday(d).format('ddd');
			// 	};
			// }
			chart = Chart.draw(timeChart);

			// Social shares charts

			var twitterChart = JSON.parse(JSON.stringify(timeChart));

			changeOptionsObj(twitterChart);

			twitterChart.options.subchart.show = false;
			twitterChart.options.size.height = 200;
			twitterChart.options.axis.x.label = {};
			twitterChart.options.axis.x.tick.culling.max = 5;
			twitterChart.options.axis.y.tick.format = function(d, i) { return Math.round(d) };
			twitterChart.options.axis.y.tick.count = 4;
			twitterChart.options.axis.y.label.text = 'Partilhas no Twitter';
			twitterChart.options.color = {pattern: ['#00ABF0'] }; 

			var twitterShareData = DataFormatter.inColumns(data, 'Twitter', 'time', 'twitter_shares');
			twitterChart.options.data.x = 'timeForTwitter';
			twitterChart.options.data.columns = twitterShareData;
			twitterChart.options.bindto = '#twitter-share-chart';
			chart2 = Chart.draw(twitterChart);

			var facebookChart = JSON.parse(JSON.stringify(twitterChart));

			changeOptionsObj(facebookChart);

			facebookChart.options.axis.x.label = {};
			facebookChart.options.axis.y.tick.format = function(d, i) { return Math.round(d) };
			facebookChart.options.axis.y.label.text = 'Partilhas no Facebook';
			facebookChart.options.color = {pattern: ['#49639E'] };

			var facebookShareData = DataFormatter.inColumns(data, 'Facebook', 'time', 'facebook_shares');
			facebookChart.options.data.x = 'timeForFacebook';
			facebookChart.options.data.columns = facebookShareData;
			facebookChart.options.bindto = '#facebook-share-chart';
			chart3 = Chart.draw(facebookChart);


			Resources.get(sourcesParams).$promise.then(function(data) {
				if(!$scope.currentSource.group) {
					$scope.sourceData = data;
				} else {
					var total_feeds = 0;
					var total_items = 0;
					var total_shares = 0;
					var twitter_shares = 0;
					var avg_twitter_shares = 0;
					var facebook_shares = 0;
					var avg_facebook_shares = 0;
					var avg_shares = 0;
					var avg_day = 0;
					var avg_month = 0;
					data.forEach(function(el) {
						total_feeds += el.total_feeds;
						total_items += el.total_items;
						total_shares += el.total_shares;
						twitter_shares += el.twitter_shares;
						avg_twitter_shares += el.avg_twitter_shares;
						facebook_shares += el.facebook_shares;
						avg_facebook_shares += el.avg_facebook_shares;
						avg_shares += el.avg_shares;
						avg_day += el.avg_day;
						avg_month += el.avg_month;
					});
					$scope.sourceData = [
						{
							total_feeds: total_feeds,
							total_items: total_items,
							total_shares: total_shares,
							twitter_shares: twitter_shares,
							avg_twitter_shares: (twitter_shares / total_items).toFixed(2),
							facebook_shares: facebook_shares,
							avg_facebook_shares: (facebook_shares / total_items).toFixed(2),
							avg_shares: (total_shares / total_items).toFixed(2),
							avg_day: (total_items / $scope.dataXLength).toFixed(2),
							avg_month: '-'
						}
					];
				}
				var shareData = [
					['Twitter', $scope.sourceData[0].twitter_shares],
					['Facebook', $scope.sourceData[0].facebook_shares]
				];
				shareChart.options.data.columns = shareData;
				chart4 = Chart.draw(shareChart);
			});

		});

	};

	var shareChart = {
		options: {
			bindto: '#share-chart',
			size: {
				height: 200
			},
			padding: {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0
			},
			data: {
				type: 'bar',
				labels: true
			},
			axis: {
        x: {
	        tick: {
	            format: function (x) { return ''; }
	        }
        }
    	},
    	color: {
    		pattern: ['#00ABF0', '#49639E']
    	},
			tooltip: {
        show: false
    	}
		}
	}

	var timeChart = {
		options: {
			bindto: '#time-chart',
			size: {
        height: 400
    	},
    	padding: {},
    	legend: {
    		show: false
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
					},
					tick: {
					}
				}
			},
			grid: {
        x: {
          show: false
        },
        y: {
          show: true
      	}
      },
			color: function(d,i) {
				return d3.scale.category20c(d);
			}
		}
	}

});

mediavizControllers.controller('SocialCtrl', function($scope, Page, Resources, Chart, DataFormatter) {

	// Multiple keywords, one source; time series for articles and shares


	Page.setTitle('Social');

	var chart;

	$scope.keywords = {};
	$scope.keywords.selected = [];

	$scope.selectedSource = {};
	$scope.selectedSource.selected = [];

	$scope.loadedKeywords = [];

	$scope.dataFormat = 'absolute';

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

	$scope.$watch('keywords.selected', function(newVal, oldVal) { 
		if($scope.selectedSource.selected.length !== 0) {
			getTotalsAndDraw();
		}
	});

	$scope.$watch('selectedSource.selected', function(newVal, oldVal) {
		$scope.selectedSource.selected = newVal;
		getTotalsAndDraw();
	});

	// $scope.loadSourceData = function(sourceObj) {
	// 	$scope.selectedSource.selected = sourceObj;
	// 	//getTotalsAndDraw();
	// }

	// $scope.redrawChart = function() {
	// 	if($scope.selectedSource.selected.length > 0) {
	// 		$scope.loadedKeywords = [];
	// 		if(chart) { chart.unload(); };
	// 		getTotalsAndDraw();			
	// 	}
	// }

	function getTotalsAndDraw() {
		$scope.keywords.selected.forEach(function(keyword) {
			var keyword = keyword;
			var selectedSource = $scope.selectedSource.selected;
			console.log(selectedSource);
			var aggregated = selectedSource.group;
			if(!aggregated) {
				$scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, source: selectedSource.name, q: keyword};
			} else {
				$scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, type: selectedSource.type, q: keyword};
			}
			if($scope.loadedKeywords.indexOf(keyword === -1)) {
				$scope.loading = true;
				Resources.get($scope.paramsObj).$promise.then(function(data) {
					$scope.loading = false;
					console.log(data);
				});
			};
		});
	}




});

mediavizControllers.controller('CompareCtrl', function($scope, Page, Resources, Chart, DataFormatter) {

	Page.setTitle('Comparador');

	var chart, chart2;

	$scope.keyword = {};
	$scope.keyword.selected = [];

	$scope.selectedSources = {};
	$scope.selectedSources.selected = [];

	$scope.loadedSources = [];

	$scope.selectDisabled = true;

	$scope.dataFormat = 'absolute';

	$scope.$watch('keyword.selected', function(newVal, oldVal) {
		if(newVal.length > 2) {
			$scope.selectDisabled = false;
		}
	});

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
			if(chart) { chart.unload({ids: sourceToRemove}); }
			$scope.loadedSources.splice(sourceToRemoveIndex, 1);
			columnToRemoveIndex = columns[0].indexOf(sourceToRemove);
			if(columnToRemoveIndex !== -1) {
				columns[0].splice(columnToRemoveIndex, 1);
				columns[1].splice(columnToRemoveIndex, 1);
				chart2.load({
					columns: columns,
					unload: true
				});
			}
		}
	});

	$scope.setDataFormat = function(dataFormat){
		if ($scope.dataFormat !== dataFormat) {
			$scope.dataFormat = dataFormat;
			$scope.loadedSources = [];
			chart.unload();
			chart2.unload();
			columns = [
				[],[]
			];
			getTotalsAndDraw();
		}
	}

	$scope.redrawChart = function() {
		$scope.loadedSources = [];
		if(chart) { chart.unload(); };
		if(chart2) { chart2.unload(); };
		columns = [
			[],[]
		];
		getTotalsAndDraw();
	}

	var columns = [
		[],[]
	];

	function getTotalsAndDraw() {
		$scope.selectedSources.selected.forEach(function(el, index) {

			var keyword = el.name;
			var aggregated = el.group;
			var timeId = 'timeFor' + keyword;
			var countId = keyword;
			var xsObj = {};
			xsObj[countId] = timeId;

			if(!aggregated) {
				$scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, source: keyword, q: $scope.keyword.selected};
			} else {
				$scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, type: el.type, q: $scope.keyword.selected};
			}

			if($scope.loadedSources.indexOf(keyword) === -1) {
				$scope.loading = true;
				Resources.get($scope.paramsObj).$promise.then(function(data) {
					$scope.loading = false;
					if(data.length > 0) {
						$scope.loadedSources.push(keyword);
						if(columns[0].length === 0) {
							columns[0] = ['x'].concat(keyword);
						} else {
							columns[0].push(keyword);
						}
						if($scope.dataFormat === 'absolute') {
							var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'articles');
							if(columns[1].length === 0) {
								columns[1] = [$scope.keyword.selected, data[0]['total_query_articles']];
							} else {
								columns[1].push(data[0]['total_query_articles']);
							}
							barChart.options.axis.y.label.text = 'Número de artigos';
							timeChart.options.axis.y.label.text = 'Número de artigos';
							//timeChart.options.data.groups = [$scope.loadedSources];
							timeChart.options.axis.y.tick.format = function(d, i) {
								return d;
							}
							barChart.options.axis.y.tick.format = function(d, i) {
								return d;
							}
						}
						if($scope.dataFormat === 'relative') {
							if(aggregated) {
								var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'percent_of_type');
								var total_query_articles = data[0]['total_query_articles'];
								var total_type_articles = data[0]['total_type_articles'];
								var percent = ((total_query_articles/total_type_articles) * 100).toFixed(2);
								if(columns[1].length === 0) {
									columns[1] = [$scope.keyword.selected, percent];
								} else {
									columns[1].push(percent);
								}
							} else {
								var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'percent_of_source');
								var total_query_articles = data[0]['total_query_articles'];
								var total_source_articles = data[0]['total_source_articles'];
								var percent = ((total_query_articles/total_source_articles) * 100).toFixed(2);
								if(columns[1].length === 0) {
									columns[1] = [$scope.keyword.selected, percent];
								} else {
									columns[1].push(percent);
								}
							}
							timeChart.options.axis.y.label.text = 'Percentagem do total de artigos';
							barChart.options.axis.y.label.text = 'Percentagem do total de artigos';
							barChart.options.axis.y.padding = { top: 0, bottom: 0 };
							timeChart.options.axis.y.padding = { top: 0, bottom: 0 };
							//timeChart.options.data.groups = [];
							timeChart.options.axis.y.tick.format = function(d, i) {
								return d + '%';
							}
							barChart.options.axis.y.tick.format = function(d, i) {
								return d + '%';
							}
						}
						if(!chart || chart.internal.data.targets.length === 0) {
							timeChart.options.data.xs = xsObj;
							timeChart.options.data.columns = formattedData;
							timeChart.options.axis.x.type = 'timeseries';
							timeChart.options.axis.x.label.text = 'Dia';
							timeChart.options.axis.x.tick.format = '%d %b';
							//timeChart.options.data.type = 'area-spline';
							timeChart.options.data.groups = [];
							chart = Chart.draw(timeChart);
						} else {
							chart.load({
								xs: xsObj,
								columns: formattedData
							});
						}

						barChart.options.data.x = 'x';
						var label = '{"' + $scope.keyword.selected + '": "Artigos com ' + $scope.keyword.selected + '"}';
						barChart.options.data.names = JSON.parse(label);
						barChart.options.data.columns = columns;
						chart2 = Chart.draw(barChart);

						// Fix c3 issue where the subchart is shown even when set to false
						d3.select("#bar-chart svg").select("g.c3-brush").remove();
					}
				});				
			}
		});		
	}

	var barChart = {
		options: {
			bindto: '#bar-chart',
			padding: {
				left: 130
			},
			size: {
				//height: 400
			},
			data: {
				type: 'bar',
				names: ''
			},
			bar: {
        width: {
            //ratio: 0.1
        }
	    },
			axis: {
				rotated: true,
				x: {
					type: 'category',
					tick: {
            multiline: false,
          },
				},
				y: {
					label: {
						position: 'outer-right'
					},
					tick: {}
				}
			},
			subchart: {
        show: false
    	},
			color: {
    		pattern: ['#395762']
    	}
		}
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
			transition: {
				duration: 0
			},
			axis: {
				x: {
					padding: {left: 0, right: 0},
					label: {
						text: 'Horas',
						position: 'outer-center'
					},
					tick: {
						fit: true
						// format: function(d, i) {
						// 		var d = d < 10 ? '0' + d : d;
						// 		return d + ':00';
						// }
					}
				},
				y: {
					//padding: {top: 1, bottom: 1},
					//min: 0,
					label: {
						text: 'Artigos',
						position: 'outer-middle'
					},
					tick: {}
				}
			},
			grid: {
        x: {
          show: false
        },
        y: {
          show: true
      	}
      },
			color: function(d) {
				return d3.scale.category20c(d);
			}
		}
	}


});

mediavizControllers.controller('ChronicleCtrl', function($scope, $rootScope, $location, $routeParams, $timeout, Page, Resources, Chart, DataFormatter) {

	Page.setTitle('Chronicle');

	var chart;

	var count = 0;

	$scope.loadedKeywords = [];

	$scope.loading = false;

	//$scope.chartCleared = false;

	$scope.sourceType = 'newspaper';

	$scope.since = '2014-10-15' || $routeParams.since;
	$scope.until;

	$scope.dataFormat = 'absolute';

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


	showPredefinedQuery();

	function showPredefinedQuery() {
		if ($scope.keywords.selected.length === 0) {
			var selectedQueryIndex = Math.floor(Math.random() * (selectedQueries.length));
			$scope.keywords.selected = selectedQueries[selectedQueryIndex].map(function(el) {
				return el;
			});
		}
	}

	function objectIsEmpty(obj) {
		return Object.keys(obj).length === 0; 
	}

	$scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
		var keywordParams = $location.search()['keywords'] || undefined;
		var keywordArray = [];
		if(keywordParams) {
			if(keywordParams.split(',').length === 1) {
				keywordArray.push(keywordParams);
			}
			if(keywordParams.split(',').length > 1) {
				keywordArray = keywordParams.split(',');
			}
			$scope.keywords.selected = keywordArray;			
		}
		if(objectIsEmpty(newVal) && !objectIsEmpty(oldVal)) {
			$scope.clearChart();
		}
	}, true);

	$scope.$watch('keywords.selected', function(newVal, oldVal) {
		angular.forEach(oldVal, function(keyword) {
			if(newVal.indexOf(keyword) === -1) {
				$scope.loadedKeywords.splice($scope.loadedKeywords.indexOf(keyword), 1);
				chart.unload({ids: keyword});
			}
		});
		if(newVal.length > 0 && newVal !== '') {
			$location.search({keywords: newVal.toString()});
			getTotalsAndDraw();			
		} else {
			$scope.clearChart();
		}

	}, true);

	$scope.clearChart = function() {
		$location.search('');
		$scope.keywords.selected = [];
		$scope.loadedKeywords = [];
		if(chart) { chart.unload(); }
	}

	$scope.setDataFormat = function(dataFormat){
		if ($scope.dataFormat !== dataFormat) {
			$scope.dataFormat = dataFormat;
			$scope.loadedKeywords = [];
			chart.flush();
			getTotalsAndDraw();
		}
	}

	$scope.setSourceType = function(sourceType){
		if ($scope.sourceType !== sourceType) {
			$scope.sourceType = sourceType;
			$scope.loadedKeywords = [];
			getTotalsAndDraw();
		}
	}

	$scope.addKeyword = function(item){
		$scope.keywords.selected.push(item);
		//$location.search({ keywords: $scope.keywords.selected.toString() });
		//getTotalsAndDraw();
	}

	// $scope.removeKeyword = function(item) {
	// 	//$scope.keywords.selected.splice($scope.keywords.selected.indexOf(item), 1);
	// 	//$scope.loadedKeywords.splice($scope.loadedKeywords.indexOf(item), 1);
	// 	//$location.search({ keywords: $scope.keywords.selected.toString() });
	// 	//chart.unload({ ids: item });
	// }

	function getTotalsAndDraw() {
		angular.forEach($scope.keywords.selected, function(el, index) {
			var keyword = el;
			var timeId = 'timeFor' + keyword;
			var countId = keyword;
			var xsObj = {};
			if($scope.loadedKeywords.indexOf(keyword) === -1) {
				$scope.loading = true;
				Resources.get({resource: 'totals', q: keyword, since: $scope.since, type: $scope.sourceType}).$promise.then(function(dataObj) {
					if(dataObj.length > 0) {
						var formattedData;
						xsObj[countId] = timeId;
						$scope.loading = false;
						$scope.loadedKeywords.push(keyword);
						if($scope.dataFormat === 'absolute') {
							formattedData = DataFormatter.inColumns(dataObj, keyword, 'time', 'articles');
							keywordChart.options.axis.y.label.text = 'Número de artigos';
						}
						if($scope.dataFormat === 'relative') {
							formattedData = DataFormatter.inColumns(dataObj, keyword, 'time', 'percent_of_type_by_day');
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
						//alert($scope.loadedKeywords);
					}
					if(chart) {
						d3.select('.c3-axis-x-label')
							.attr('transform', 'translate(0, -10)');
					}
				});
			}
		});
	};


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
			transition: {
				duration: 0
			},
			axis: {
				x: {
					//padding: {left: 0, right: 0},
					label: {
						text: 'Dias',
						position: 'outer-center'
					},
					type: 'timeseries',
					tick: {
						culling: {
              max: 5 // the number of tick texts will be adjusted to less than this value
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
						format: function(d,i) {
							if($scope.dataFormat === 'absolute') {
								return d;
							}
							if($scope.dataFormat === 'relative') {
								return d + '%';
							}
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
			grid: {
        x: {
          show: false
        },
        y: {
          show: true
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

mediavizControllers.controller('FlowCtrl', function($scope, $location, $routeParams, Page, Resources, SourceList, Chart, DataFormatter) {

	Page.setTitle('Flow');

	$scope.selectedSources.selected = [];

	$scope.by = $routeParams.by || 'hour';
	$scope.since = $routeParams.since;
	$scope.until = $routeParams.until;
	$scope.sourceData = [];
	$scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since};

	$scope.dataFormat = 'absolute';

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


	$scope.setDataFormat = function(dataFormat){
		if ($scope.dataFormat !== dataFormat) {
			$scope.dataFormat = dataFormat;
			$scope.loadedSources = [];
			chart.unload();
			getTotalsAndDraw();
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
			if(chart) { chart.unload({ids: sourceToRemove}); }
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
			var aggregated = el.group;
			var timeId = 'timeFor' + keyword;
			var countId = keyword;
			var xsObj = {};
			xsObj[countId] = timeId;

			if(!aggregated) {
				$scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, source: keyword};
			} else {
				$scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, type: el.type};
			}

			if($scope.loadedSources.indexOf(keyword) === -1) {
				$scope.loading = true;
				Resources.get($scope.paramsObj).$promise.then(function(data) {
					$scope.loading = false;
					$scope.loadedSources.push(keyword);
					if($scope.dataFormat === 'absolute') {
						var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'articles');
						timeChart.options.axis.y.label.text = 'Número de artigos';
						timeChart.options.data.groups = [$scope.loadedSources];
						timeChart.options.axis.y.tick.format = function(d, i) {
							return d;
						}
					}
					if($scope.dataFormat === 'relative') {
						if(aggregated) {
							var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'percent_of_type');
						} else {
							var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'percent_of_source');
						}
						timeChart.options.axis.y.label.text = 'Percentagem do total de artigos';
						timeChart.options.data.groups = [];
						timeChart.options.axis.y.tick.format = function(d, i) {
							return d + '%';
						}
					}
					if(!chart || chart.internal.data.targets.length === 0) {
						timeChart.options.data.xs = xsObj;
						timeChart.options.data.columns = formattedData;
						if($scope.by === 'hour') {
							//timeChart.options.data.type = 'area';
							timeChart.options.axis.x.type = '';
							timeChart.options.axis.x.label.text = 'Hora';
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
							timeChart.options.axis.x.tick.format = function(d, i) {
								return d;
							};
						}
						if($scope.by === 'week') {
							timeChart.options.axis.x.type = '';
							timeChart.options.axis.x.label.text = 'Dia da semana';
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
			transition: {
				duration: 0
			},
			axis: {
				x: {
					padding: {left: 0, right: 0},
					label: {
						text: 'Horas',
						position: 'outer-center'
					},
					tick: {
						fit: true
						// culling: {
              // max: 12 // the number of tick texts will be adjusted to less than this value
            // },
						// format: function(d, i) {
						// 		var d = d < 10 ? '0' + d : d;
						// 		return d + ':00';
						// }
					}
				},
				y: {
					//padding: {top: 1, bottom: 1},
					//min: 0,
					label: {
						text: 'Artigos',
						position: 'outer-middle'
					},
					tick: {}
				}
			},
			grid: {
        x: {
          show: false
        },
        y: {
          show: true
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


