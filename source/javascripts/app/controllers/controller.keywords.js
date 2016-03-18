mediavizControllers.controller('KeywordsCtrl', function($scope, $rootScope, $location, $timeout, $filter, Page, SourceList, SAPONews, SAPODataFormatter, Resources, DataFormatter) {

  Page.setTitle('Keywords');

  var dateExtent = ["2015-09-01", "2015-09-30"];

  $scope.urlParams = {
    source: null,
    since: $rootScope.startDate,
    until: $rootScope.endDate,
    cycle: null,
    by: null,
    data: 'articles'
  }

  $scope.urlParams.cycle = $location.search()['cycle'] || 'day';
  $scope.urlParams.by = $location.search()['by'] || 'day';

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

  $scope.countsArray = [];
  $scope.articlesCount = [];
  $scope.sharesCount = [];
  $scope.twitterSharesCount = [];
  $scope.facebookSharesCount = [];

  $scope.loadingQueue = [];

  SourceList.getDefaultList().then(function(data) {
    $scope.sourceList = data;
    $scope.defaultSource = 'News';
    if(!$location.search()['source']) {
      $scope.urlParams.source = $filter('filter')($scope.sourceList, {name: $scope.defaultSource}, true)[0];
    }
    initializeController();
  });

  function showArticles(d) {
    if($scope.SAPOMode) return;
    var dateSince = moment(d.x).format("YYYY-MM-DD");
    var dateUntil = moment(dateSince).add(1, 'days').format("YYYY-MM-DD");
    var keyword = d.name;
    var source = $scope.urlParams.source;
    setParamsforArticles(dateSince, dateUntil, keyword, source);
  }

  function setParamsforArticles(dateSince, dateUntil, keyword, source) {
    $location.path('/articles').search({keyword: keyword, since: dateSince, until: dateUntil, source: source.name });
    $scope.$apply();
  }

  function initializeController() {

    $scope.clearChart = function() {
      $scope.keywords.selected = [];
      $scope.loadedKeywords = [];
      $location.search('keywords', null);
      $scope.timeData = [];
      $scope.countData = []
      $scope.totalShareData = [];
      $scope.twitterShareData = [];
      $scope.facebookShareData = [];
      // $scope.countsArray = [];
      // $scope.articlesCount = [];
      // $scope.sharesCount = [];
      // $scope.twitterSharesCount = [];
      // $scope.facebookSharesCount = [];
      $scope.$broadcast('destroyChart');
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
      $scope.$broadcast('resizeChart', newVal.length * 20);
      var newKeywords = newVal.map(function(el) { return el });
      var oldKeywords = oldVal.map(function(el) { return el });
      oldKeywords.forEach(function(oldKeyword) {
        if(newKeywords.indexOf(oldKeyword) === -1) {
          $scope.loadedKeywords.splice($scope.loadedKeywords.indexOf(oldKeyword), 1);
          removeKeywordFromCountsArray(oldKeyword);
          $scope.$broadcast('sourceRemoved', oldKeyword);
        }
      });
      if(newVal.length > 0 && newVal !== '') {
        $location.search('keywords', newVal.toString());
        if(!oldVal || newVal !== oldVal) {
          getSourceData();          
        }
      } else {
        $scope.clearChart();
      };
    }, true);

    function removeKeywordFromCountsArray(oldKeyword) {
      $scope.countsArray = $scope.countsArray.filter(function(el) {
        if(el[0] !== oldKeyword) {
          return el;
        };
      });
      $scope.articlesCount = $scope.articlesCount.filter(function(el) {
        if(el[0] !== oldKeyword) {
          return el;
        };
      });
      $scope.sharesCount = $scope.sharesCount.filter(function(el) {
        if(el[0] !== oldKeyword) {
          return el;
        };
      });
      $scope.twitterSharesCount = $scope.twitterSharesCount.filter(function(el) {
        if(el[0] !== oldKeyword) {
          return el;
        };
      });
      $scope.facebookSharesCount = $scope.facebookSharesCount.filter(function(el) {
        if(el[0] !== oldKeyword) {
          return el;
        };
      });
    }

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
      $scope.countsArray = [];
      $scope.articlesCount = [];
      $scope.sharesCount = [];
      $scope.twitterSharesCount = [];
      $scope.facebookSharesCount = [];
      getSourceData();
    }, true);

    $scope.$watch('loadingQueue', function(newVal, oldVal) {
      if($scope.loadingQueue.length !== 0) {
        $rootScope.loading = true;
      } else {
        $rootScope.loading = false;
      }
    }, true);

    $scope.$watch('countsArray', function(newVal, oldVal) {
      $timeout(function() {
        var countValues = newVal.map(function(el) {
          return el[1];
        });
        var maxValue = d3.max(countValues);
        if(maxValue) {
          $scope.$broadcast('updateMaxY', maxValue);
        }
      }, 10);
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
        return {resource: 'articles', since: $scope.urlParams.since, until: $scope.urlParams.until, type: $scope.urlParams.source.acronym, q: keyword, by: $scope.urlParams.by};
      }
    }

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
          var paramsObj = createParamsObj(keyword);
          Resources.get(paramsObj).$promise.then(function(data) {
            if(data.length) {
              $scope.loadingQueue.splice($scope.loadingQueue.indexOf(keyword), 1);
              $scope.loadedKeywords.push(keywordName);
              xsObj[countId] = timeId;
              if($scope.urlParams.data === 'percent') {
                  $scope.timeData = DataFormatter.inColumns(data, keyword, 'time', 'percent_of_type_by_day');
              } else {
                $scope.timeData = DataFormatter.inColumns(data, keyword, 'time', 'count');
              }

              
              $scope.countData = DataFormatter.sumValue(data, keyword, 'count', keyword);

              $scope.articlesCount.push([keyword, $scope.countData[1][1]]);

              $scope.countsArray.push(
                [keyword, $scope.countData[1][1]]
                );

              $scope.xsObj = xsObj;
              $timeout(function() {
                $scope.$broadcast('changeZoomRange', [moment(dateExtent[0]).format("YYYY-MM-DD"), moment(dateExtent[1]).format("YYYY-MM-DD")]);
              }, 10);
            } else {
              $scope.loadingQueue.splice($scope.loadingQueue.indexOf(keyword), 1);
            }
          });
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

    function calculateSize() {
      keywords = $location.search()['keywords'];
      console.log(keywords);
      if(!keywords || keywords.split(',').length === 1) {
        return 20;
      }
      if(keywords.split(',').length > 1) {
        return keywords.split(',').length * 20;
      }
      
    }

    $scope.barChartOpts = {
      name: 'barCounts',
      id: 'countChart',
      size: {
        height: calculateSize()
      },
      data: {
        x: 'x',
        // labels: false
      },
      bar: {
        width: {ratio: 1}
      },
      axis: {
        rotated: true,
        x: {
          type: 'category',
          // tick: {values: []},
          show: false
        },
        y: {
          padding: 0,
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
        right: 0,
        top: -6,
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
            format: '%Y-%m-%d',
            culling: {
              max: 5 // the number of tick texts will be adjusted to less than this value
            },
          },
          extent: dateExtent
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
          subchart: {
            show: true,
            size: {
              height: 20
            }
          }
        };

  }

});