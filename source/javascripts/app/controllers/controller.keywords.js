mediavizControllers.controller('KeywordsCtrl', function($scope, $rootScope, $location, $timeout, $filter, Page, SourceList, SAPONews, SAPODataFormatter, Resources, DataFormatter) {

  Page.setTitle('Palavras-chave');

  if($location.path().indexOf('/SAPO') !== -1) {
    $scope.SAPOMode = true;
  }

  $scope.urlParams = {
    source: null,
    since: "2015-01-01",
    until: moment().format("YYYY-MM-DD"),
    cycle: null,
    by: null,
    data: 'articles'
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

  $scope.sourceList;

  $scope.loadedKeywords = [];

  $scope.keywords = {};
  $scope.keywords.selected = [];

  $scope.loadingQueue = [];

  if($scope.SAPOMode) {
    $scope.sourceList = SourceList.getSAPONewsList();
    $scope.defaultSource = 'Todas';
    if(!$location.search()['source']) {
      $scope.urlParams.source = $filter('filter')($scope.sourceList, {name: $scope.defaultSource}, true)[0];
    }
    initializeController();
    // $scope.selectedIndex.value = 0;
  } else {
    SourceList.getDefaultList().then(function(data) {
      $scope.sourceList = data;
      $scope.defaultSource = 'Todas nacionais';
      if(!$location.search()['source']) {
        $scope.urlParams.source = $filter('filter')($scope.sourceList, {name: $scope.defaultSource}, true)[0];
      }
      initializeController();
    });
  }

  $scope.barChartOpts = {
    id: 'countChart',
    size: {
      height: 60
    },
    data: {
      x: 'x',
      labels: true
    },
    bar: {
      width: {ratio: 0.9}
    },
    axis: {
      rotated: true,
      x: {
        type: 'category',
        tick: {values: []},
        show: false
      },
      y: {
        show: false
      }
    },
    tooltip: {
      show: true,
      grouped: false,
      format: {
        title: function() {
          return ''
        }
      }
    },
    padding: {
      left: 0,
      right: 100,
      top: 0,
      bottom: 0
    },
    legend: {
      show: false
    }
  };

  $scope.barChartYAxisOpts = {};

  angular.copy($scope.barChartOpts, $scope.barChartYAxisOpts);

  $scope.barChartYAxisOpts.axis.y.show = true;


  $scope.timeChartOpts = {
    size: {
      height: 450
    },
    legend: {
      position: 'right'
    },
    tooltip: {
      grouped: true 
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
        type: 'timeseries',
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
        grid: {
          x: {
            show: false
          },
          y: {
            show: true
          }
        },
        padding: {
          left: 50
        },
      };

  function showArticles(d) {
    if($scope.SAPOMode) return;
    var date = moment(d.x).format("YYYY-MM-DD");
    var keyword = d.name;
    var source = $scope.urlParams.source;
    setParamsforArticles(date, keyword, source);
  }

  function setParamsforArticles(date, keyword, source) {
    $location.path('/articles').search({keyword: keyword, since: date, until: date, source: source.name });
    $scope.$apply();
  }

  function initializeController() {

    $scope.clearChart = function() {
      $scope.keywords.selected = [];
      $scope.loadedKeywords = [];
      $location.search('keywords', null);
      $scope.$broadcast('destroyChart');
      if(countsArray.length) countsArray = [];
    }

    $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
      var keywords = $location.search()['keywords'];
      var source = $location.search()['source'];
      var since = $location.search()['since'];
      var until = $location.search()['until'];
      var cycle = $location.search()['cycle'];
      var by = $location.search()['by'];
      var dataType = $location.search()['data'];
      var keywordArray = [];
      if(source) {
        $scope.urlParams.source = $filter('filter')($scope.sourceList, {name: source}, true)[0];
      }
      if(keywords && keywords.length) {
        if(keywords.split(',').length === 1) {
          keywordArray.push(keywords);
        }
        if(keywords.split(',').length > 1) {
          keywordArray = keywords.split(',');
        }
        $scope.keywords.selected = keywordArray;
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

    $scope.$watch('keywords.selected', function(newVal, oldVal) {
      var newKeywords = newVal.map(function(el) { return el });
      var oldKeywords = oldVal.map(function(el) { return el });
      oldKeywords.forEach(function(oldKeyword) {
        if(newKeywords.indexOf(oldKeyword) === -1) {
          $scope.loadedKeywords.splice($scope.loadedKeywords.indexOf(oldKeyword), 1);
          $scope.$broadcast('sourceRemoved', oldKeyword);
        }
      })
      if(newVal.length > 0 && newVal !== '') {
        $location.search('keywords', newVal.toString());
        getSourceData();
      } else {
        $scope.clearChart();
      }
    }, true);

    $scope.$watch('urlParams', function(urlParams) {
      for (var key in urlParams) {
        if(urlParams[key] && urlParams[key].name) {
          $location.search(key, urlParams[key].name);
        } else if(urlParams[key]) {
          $location.search(key, urlParams[key])
        } else if(!urlParams[key]) {
          $location.search(key, null)
        }
      }
      $scope.loadedKeywords = [];
      getSourceData();
    }, true);

    $scope.$watch('loadingQueue', function(newVal, oldVal) {
      if($scope.loadingQueue.length !== 0) {
        $rootScope.loading = true;
      } else {
        $rootScope.loading = false;
      }
    }, true);

    function tokenizeKeyword(keyword) {
      if(keyword) {
        var keyword = keyword.trim().split(' ').join(' AND ');
        return keyword;
      } else {
        return undefined;
      }
    }

    function createSAPOParamsObj(keyword) {
      return {beginDate: $scope.urlParams.since, endDate: $scope.urlParams.until, timeFrame: $filter('uppercase')($scope.urlParams.by), q: tokenizeKeyword(keyword), source: $scope.urlParams.source.value};
    }

    function createParamsObj(keyword) {
      if($scope.urlParams.source.group) {
        return {resource: 'totals', since: $scope.urlParams.since, until: $scope.urlParams.until, type: $scope.urlParams.source.type, q: keyword};    
      } else {
        return {resource: 'totals', since: $scope.urlParams.since, until: $scope.urlParams.until, source: $scope.urlParams.source.acronym, q: keyword};
      }
    }

    var countsArray = [];

    function getSourceData() {
      if(!$scope.urlParams.source) {
        return;
      }
      $scope.keywords.selected.forEach(function(keyword, index) {
        var keywordName = keyword;
        var timeId = 'timeFor' + keywordName;
        var countId = keywordName;
        var xsObj = {};

        if($scope.loadedKeywords.indexOf(keywordName) === -1) {
          $scope.loadingQueue.push(keyword);
          if($scope.SAPOMode) {
            var paramsObj = createSAPOParamsObj(keyword);
            SAPONews.get(paramsObj).then(function(data) {
              $scope.loadingQueue.splice($scope.loadingQueue.indexOf(keyword), 1);
              $scope.loadedKeywords.push(keywordName);
              xsObj[countId] = timeId;
              var data = data.data.facet_counts.facet_ranges.pubdate.counts;

              var dayData = SAPODataFormatter.getDays(data);
              var dayDataPercent = SAPODataFormatter.getDaysPercent(data);
              var countData = DataFormatter.countOnly(dayData, keyword, 'total_articles');
              var weekData = SAPODataFormatter.getWeekDays(data);
              var monthData = SAPODataFormatter.getMonths(data);

              if($scope.urlParams.data === 'percent') {
                $scope.dayData = DataFormatter.inColumns(dayDataPercent, keyword, 'time', 'percent_of_source');
                $scope.weekData = DataFormatter.inColumns(weekData, keyword, 'time', 'percent_of_source');
                $scope.monthData = DataFormatter.inColumns(monthData, keyword, 'time', 'percent_of_source');
              } else {
                $scope.dayData = DataFormatter.inColumns(dayData, keyword, 'time', 'articles');
                $scope.weekData = DataFormatter.inColumns(weekData, keyword, 'time', 'articles');
                $scope.monthData = DataFormatter.inColumns(monthData, keyword, 'time', 'articles');
              }

              $scope.countData = [['x', keyword], countData[0]];

              setChartDataForCycle();

              $scope.xsObj = xsObj;
            });
          } else {
            var paramsObj = createParamsObj(keyword);
            Resources.get(paramsObj).$promise.then(function(data) {
              $scope.loadingQueue.splice($scope.loadingQueue.indexOf(keyword), 1);
              $scope.loadedKeywords.push(keywordName);
              xsObj[countId] = timeId;
              if($scope.urlParams.data === 'percent') {
                if($scope.urlParams.source.group) {
                  $scope.timeData = DataFormatter.inColumns(data, keyword, 'time', 'percent_of_type_by_day');                
                } else {
                  $scope.timeData = DataFormatter.inColumns(data, keyword, 'time', 'percent_of_query');
                }
              } else {
                console.log('called');
                $scope.timeData = DataFormatter.inColumns(data, keyword, 'time', $scope.urlParams.data);
              }

              // $scope.timeChartOpts.axis.x.type = 'timeseries';
              
              $scope.countData = DataFormatter.sumValue(data, keyword, 'articles', keyword);


              $scope.totalShareData = DataFormatter.sumValue(data, keyword, 'total_shares', keyword);
              $scope.twitterShareData = DataFormatter.sumValue(data, keyword, 'twitter_shares', keyword);
              $scope.facebookShareData = DataFormatter.sumValue(data, keyword, 'facebook_shares', keyword);

              countsArray.push($scope.countData[1][1]);
              countsArray.push($scope.totalShareData[1][1]);
              countsArray.push($scope.twitterShareData[1][1]);
              countsArray.push($scope.facebookShareData[1][1]);

              var maxValue = d3.max(countsArray);

              // $scope.barChartOpts.axis.y.max = maxValue;
              $timeout(function() {
                $scope.$broadcast('updateMaxY', maxValue);
              }, 10);

              $scope.xsObj = xsObj;

              // $scope.$broadcast('flushChart');
            });
          }
        }
      })
    }

    function setChartDataForCycle() {
      if($scope.urlParams.cycle === 'hour') {
        if($scope.SAPOMode) {
          $scope.timeData = $scope.monthData;
        }
        $scope.timeChartOpts.axis.x.type = '';
        $scope.$broadcast('changeXAxisFormat', {type: '', format: function(d) { return moment().hour(d).format('HH'); }});
      }
      if($scope.urlParams.cycle === 'day') {
        if($scope.SAPOMode) {
          $scope.timeData = $scope.dayData;
        }
        $scope.timeChartOpts.axis.x.type = 'timeseries';
        $scope.$broadcast('changeXAxisFormat', {type: 'timeseries', format: function(d) { return moment(d).format('YYYY-MM-DD')} });
      }
      if($scope.urlParams.cycle === 'week') {
        if($scope.SAPOMode) {
          $scope.timeData = $scope.weekData;
        }
        $scope.timeChartOpts.axis.x.type = 'timeseries';
        $scope.$broadcast('changeXAxisFormat', {type: '', format: function(d) { return moment().isoWeekday(d).format('ddd');} });
      }
      if($scope.urlParams.cycle === 'month') {
        if($scope.SAPOMode) {
          $scope.timeData = $scope.monthData;
        }
        $scope.timeChartOpts.axis.x.type = 'timeseries';
        $scope.$broadcast('changeXAxisFormat', {type: '', format: function(d) { return moment(d, 'MM').format('MMM');}});
      }
    }

  }

});