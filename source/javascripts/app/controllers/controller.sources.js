mediavizControllers.controller('SourcesCtrl', function($scope, $rootScope, $location, $filter, $timeout, $routeParams, $mdDialog, Page, SAPONews, SAPODataFormatter, DataFormatter, SourceList, Resources) {

  Page.setTitle('Fontes');

  if($location.path().indexOf('/SAPO') !== -1) {
    $scope.SAPOMode = true;
  }

  $scope.sourceList;

  if($scope.SAPOMode) {
    $scope.sourceList = SourceList.getSAPONewsList();
    initializeController();
  } else {
    SourceList.getDefaultList().then(function(data) {
      $scope.sourceList = data;
      initializeController();
    });
  }

  $scope.selectedSources = [];
  $scope.loadedSources = [];

  $scope.loadingQueue = [];

  var timeFrame = 'DAY';

  $scope.urlParams = {
    keyword: $location.search()['keyword'] || null,
    sources: $location.search()['sources'] || null,
    since: "2015-01-01",
    until: moment().format("YYYY-MM-DD"),
    cycle: $location.search()['cycle'] || 'day',
    data: setDefaultData()
  }

  if($scope.SAPOMode) {
    $scope.urlParams.cycle = $location.search()['cycle'] || 'day';
    $scope.urlParams.by = $location.search()['by'] || 'day';
  }

  function setDefaultData() {
    if($scope.SAPOMode !== true && !$location.search()['data']) {
      return 'articles';
    } else if($scope.SAPOMode === true && !$location.search()['data']){
      return 'percent';
    }
  }

  $scope.timeChartOpts = {
    size: {
      height: 450
    },
    legend: {
      position: 'right'
    },
    tooltip: {
      grouped: true,
      format: {
        title: function (d) {
          if(!$scope.SAPOMode && $scope.urlParams.cycle === 'day') {
            return moment(d).format('YYYY-MM-DD') + ' (clique para ver artigos)';
          }
        }
      } 
    },
    data: {
      onclick: function (d, i) { showArticles(d); }
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
          type: '',
          tick: {
            culling: {
              max: 5 // the number of tick texts will be adjusted to less than this value
            },
            format: ''
          }
        },
        y: {
          min: 0,
          padding: {bottom: 0},
          tick: {
            format: function(d) {
              if($scope.urlParams.data === 'percent') {
                return d + '%';
              } else {
                return d;
              }
            }
          }
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

  function showArticles(d) {
    if($scope.SAPOMode) return;
    var date = moment(d.x).format("YYYY-MM-DD");
    var source = d.name;
    var keyword = $scope.urlParams.keyword;
    setParamsforArticles(date, keyword, source);
  }

  function setParamsforArticles(date, keyword, source) {
    $location.path('/articles').search({keyword: keyword, since: date, until: date, source: source });
    $scope.$apply();
  }

  function initializeController() {

    $scope.$watch(function() { return $location.search() }, function(newVal) {
      var sourceList = newVal['sources'];
      var keyword = newVal['keyword'];
      var since = newVal['since'];
      var until = newVal['until'];
      var cycle = newVal['cycle'];
      var by = newVal['by'];
      var dataType = $location.search()['data'];
      if(sourceList) {
        var selectedSources = [];
        var sourceArray = sourceList.split(',').length ? sourceList.split(',') : sourceList;
        // $timeout(function() {
          sourceArray.forEach(function(source) {
            var sourceObj = $filter('filter')($scope.sourceList, {name: source}, true)[0];
            selectedSources.push(sourceObj);
          });
          $scope.selectedSources = selectedSources;

        // }, 500)
      }
      if(keyword) {
        $scope.inputKeyword = keyword;
        $scope.urlParams.keyword = keyword;
      //   $scope.searchSwitch = true;
      // } else {
      //   // $scope.clearInput();
      //   $scope.searchSwitch = false;
      }
      if(since) {
        $scope.urlParams.since = since;
      }
      if(until) {
        $scope.urlParams.until = until;
      }
      if(cycle) {
        $scope.urlParams.cycle = cycle;
      }
      if(by) {
        $scope.urlParams.by = by;
      }
      if(dataType) {
        $scope.urlParams.data = dataType;
      }
    }, true);

    $scope.checkValue = function(value) {
      if(value) {
        var domNode = document.getElementById("search-input");
        $timeout(function() {
          angular.element(domNode).focus();
        }, 0);
      } else {
        if($scope.urlParams.keyword) $scope.clearInput();
      }
    }

    $scope.clearInput = function() {
      $scope.inputKeyword = null;
      $location.search('keyword', null);
      $scope.urlParams.keyword = null;
    }

    // $scope.chartData;

    $scope.$watch('selectedSources', function(newVal, oldVal) {
      var sources = newVal.map(function(el) { return el.name }) || null;
      var oldSources = oldVal.map(function(el) { return el.name });
      oldSources.forEach(function(oldSource) {
        if(sources.indexOf(oldSource) === -1) {
          $scope.loadedSources.splice($scope.loadedSources.indexOf(oldSource), 1);
          $scope.$broadcast('sourceRemoved', oldSource);
        }
      })
    	if(newVal.length > 0 && newVal !== '') {
    		var sources = newVal.map(function(el) { return el.name });
        $location.search('sources', sources.join(','));
        getSourceData();
    	} else {
        $scope.clearChart();
      }
    }, true);

    $scope.$watch('urlParams', function(urlParams) {
      for (var key in urlParams) {
        urlParams[key] ? $location.search(key, urlParams[key]) : null;
      }
      $scope.loadedSources = [];
      getSourceData();      
    }, true);

    $scope.$watch('loadingQueue', function(newVal, oldVal) {
      if($scope.loadingQueue.length !== 0) {
        $rootScope.loading = true;
      } else {
        $rootScope.loading = false;
      }
    }, true);

    $scope.setQuery = function(value) {
      if(value.length) {
        $scope.urlParams.keyword = value;        
      } else {
        $scope.clearInput();
      }
    }

    $scope.clearChart = function() {
      $scope.selectedSources = [];
      $scope.urlParams.keyword = null;
      $scope.inputKeyword = null;
      $scope.loadedSources = [];
      $location.search('sources', null);
    }


    function createSAPOParamsObj(source) {
  		return {beginDate: $scope.urlParams.since, endDate: $scope.urlParams.until, timeFrame: $filter('uppercase')($scope.urlParams.by), q: tokenizeKeyword($scope.urlParams.keyword), source: source.value};
    }

    function createParamsObj(source) {
      if(source.group) {
        return {resource: 'totals', since: $scope.urlParams.since, until: $scope.urlParams.until, type: source.type, q: $scope.urlParams.keyword, by: $scope.urlParams.cycle};    
      } else {
        return {resource: 'totals', since: $scope.urlParams.since, until: $scope.urlParams.until, source: source.acronym, q: $scope.urlParams.keyword, by: $scope.urlParams.cycle};
      }   
    }

    function tokenizeKeyword(keyword) {
      if(keyword) {
        var keyword = keyword.trim().split(' ').join(' AND ');
        return keyword;
      } else {
        return undefined;
      }
    }

    function getSourceData() {
    	$scope.selectedSources.forEach(function(source, index) {
  			var sourceName = source.name;
        var timeId = 'timeFor' + sourceName;
  			var countId = sourceName;
  			var xsObj = {};

        if($scope.loadedSources.indexOf(sourceName) === -1) {
          $scope.loadingQueue.push(sourceName);
          if($scope.SAPOMode) {
            var paramsObj = createSAPOParamsObj(source);
      			SAPONews.get(paramsObj).then(function(data) {
      				$scope.loadedSources.push(sourceName);
              $scope.loadingQueue.splice($scope.loadingQueue.indexOf(sourceName), 1);
              xsObj[countId] = timeId;
              var data = data.data.facet_counts.facet_ranges.pubdate.counts;
              var dayData = SAPODataFormatter.getDays(data);
              var dayDataPercent = SAPODataFormatter.getDaysPercent(data);
              var weekData = SAPODataFormatter.getWeekDays(data);
              var monthData = SAPODataFormatter.getMonths(data);

              if($scope.urlParams.data === 'percent') {
                $scope.dayData = DataFormatter.inColumns(dayDataPercent, countId, 'time', 'percent_of_source');
                $scope.weekData = DataFormatter.inColumns(weekData, countId, 'time', 'percent_of_source');
                $scope.monthData = DataFormatter.inColumns(monthData, countId, 'time', 'percent_of_source');
              } else {
                $scope.dayData = DataFormatter.inColumns(dayData, sourceName, 'time', 'articles');
                $scope.weekData = DataFormatter.inColumns(weekData, countId, 'time', 'articles');
                $scope.monthData = DataFormatter.inColumns(monthData, countId, 'time', 'articles');
              }

              setChartDataForCycle();

              $scope.xsObj = xsObj;
    				});
          } else {
            var paramsObj = createParamsObj(source);
            Resources.get(paramsObj).$promise.then(function(data) {
              setChartDataForCycle();
              $scope.loadedSources.push(sourceName);
              $scope.loadingQueue.splice($scope.loadingQueue.indexOf(sourceName), 1);
              xsObj[countId] = timeId;
              if($scope.urlParams.data === 'percent') {
                if(source.group) {
                  $scope.chartData = DataFormatter.inColumns(data, sourceName, 'time', 'percent_of_type');                
                } else {
                  $scope.chartData = DataFormatter.inColumns(data, sourceName, 'time', 'percent_of_source');
                }
              } else {
                $scope.chartData = DataFormatter.inColumns(data, sourceName, 'time', $scope.urlParams.data);
              }


              $scope.xsObj = xsObj;
            });
          }
    		}
    	})
    }

    function setChartDataForCycle() {
      if($scope.urlParams.cycle === 'hour') {
        if($scope.SAPOMode) {
          $scope.chartData = $scope.monthData;
        }
        $scope.timeChartOpts.axis.x.type = '';
        $scope.$broadcast('changeXAxisFormat', {type: '', format: function(d) { return moment().hour(d).format('HH'); }});
      }
      if($scope.urlParams.cycle === 'day') {
        if($scope.SAPOMode) {
          $scope.chartData = $scope.dayData;
        }
        $scope.timeChartOpts.axis.x.type = 'timeseries';
        $scope.$broadcast('changeXAxisFormat', {type: 'timeseries', format: function(d) { return moment(d).format('YYYY-MM-DD')} });
      }
      if($scope.urlParams.cycle === 'week') {
        if($scope.SAPOMode) {
          $scope.chartData = $scope.weekData;
        }
        $scope.timeChartOpts.axis.x.type = 'timeseries';
        $scope.$broadcast('changeXAxisFormat', {type: '', format: function(d) { return moment().isoWeekday(d).format('ddd');} });
      }
      if($scope.urlParams.cycle === 'month') {
        if($scope.SAPOMode) {
          $scope.chartData = $scope.monthData;
        }
        $scope.timeChartOpts.axis.x.type = 'timeseries';
        $scope.$broadcast('changeXAxisFormat', {type: '', format: function(d) { return moment(d, 'MM').format('MMM');}});
      }
    }

  }


});