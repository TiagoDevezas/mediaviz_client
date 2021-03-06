'use strict';

var mediavizControllers = angular.module('mediavizControllers', []);

mediavizControllers.controller('RootCtrl', function($scope, SourceList) {

  $scope.sourceList = [];
  $scope.sourceListOriginal = [];
  $scope.selectedSources = {};
  $scope.selectedSources.selected = [];


  if($scope.sourceList.length === 0) {
    SourceList.get(function(data) {
      $scope.sourceList = data;
      //$scope.sourceListOriginal = $scope.sourceList;
      //$scope.sourceListOriginal.splice(0, 3);
      //$scope.selectedSource = $scope.sourceList[0];
      $scope.selectedSources.selected.push($scope.sourceList[0]);
      //getTotalsAndDraw();
    });
  } else {
    $scope.selectedSources.selected.push($scope.sourceList[0]);
  }

  $scope.groupSourcesByType = function(item) {
    if(item.type === 'national') {
      return 'Jornais Nacionais';
    };
    if(item.type === 'international') {
      return 'Jornais Internacionais';
    };
    if(item.type === 'blogs') {
      return 'Blogues';
    };
    if(item.type === 'archive') {
      return 'Arquivo';
    };
  }

});

mediavizControllers.controller('HomeCtrl', function($scope, $location, Resources, Page, $timeout) {

  Page.setTitle('Início');

  $scope.selectedSources = {};
  $scope.selectedSources.selected = [];

  $scope.stats = [];
  $scope.hasData = false;

  getStats();

  $scope.goToSourcePage = function(source, model) {
    $location.path('/source/' + source.acronym);
  }

  // $scope.groupSourcesByType = function(item) {
  //  if(item.type === 'national') {
  //    return 'Jornais Nacionais';
  //  }
  //  if(item.type === 'international') {
  //    return 'Jornais Internacionais';
  //  }
  //  if(item.type === 'blogs') {
  //    return 'Blogues';
  //  }
  // }

  function getStats() {
    Resources.get({resource: 'stats'}).$promise.then(function(data) {
      $scope.stats = data[0];
      $scope.hasData = true;
    });
  }

});

mediavizControllers.controller('AboutCtrl', function($scope, Resources, Page) {
  Page.setTitle('Sobre');

  $scope.stats = [];

  getStats();

  function getStats() {
    Resources.get({resource: 'stats'}).$promise.then(function(data) {
      $scope.stats = data[0];
    });
  }

});

mediavizControllers.controller('SourceCtrl', function($scope, $routeParams, $location, Page, Resources, Chart, DataFormatter, SourceList) {

  $scope.sourceList = [];

  $scope.currentSource = {};

  $scope.by = 'day';

  $scope.loading = false;

  var totalsParams = {};
  var sourcesParams = {};

  $scope.goToSourcePage = function(source, model) {
    $location.path('/source/' + source.acronym);
  }

  // $scope.groupSourcesByType = function(item) {
  //  if(item.type === 'national') {
  //    return 'Jornais Nacionais';
  //  }
  //  if(item.type === 'international') {
  //    return 'Jornais Internacionais';
  //  }
  //  if(item.type === 'blogs') {
  //    return 'Blogues';
  //  }
  // }

  SourceList.get(function(data) {
    $scope.sourceList = data;
    $scope.currentSource = $scope.sourceList.filter(function(obj) {
      if(obj.acronym === $routeParams.name)
        return obj;
    })[0];
    Page.setTitle($scope.currentSource.name);

    $scope.selectedSources.selected = $scope.currentSource;

    totalsParams = {resource: 'totals', since: $scope.since, source: $scope.currentSource.acronym, by: $scope.by};
    sourcesParams = {resource: 'sources', name: $scope.currentSource.acronym};

    if($scope.currentSource.group) {
      totalsParams = {resource: 'totals', since: $scope.since, type: $scope.currentSource.type, by: $scope.by };
      sourcesParams = {resource: 'sources', type: $scope.currentSource.type};
    }

    getTotalsAndDraw();
  });

  $scope.since = '' || $routeParams.since;
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
    $scope.loading = true;
    Resources.get(totalsParams).$promise.then(function(data) {
      $scope.loading = false;
      var articleData = DataFormatter.inColumns(data, $scope.currentSource.name, 'time', 'articles');
      $scope.dataXLength = articleData[0][0].length;
      // console.log($scope.dataXLength);
      timeChart.options.data.columns = articleData;
      timeChart.options.data.x = 'timeFor' + $scope.currentSource.name;
      changeOptionsObj(timeChart);
      // if($scope.by === 'hour') {
      //  timeChart.options.axis.x.type = '';
      //  timeChart.options.axis.x.label.text = 'Hora';
      //  timeChart.options.axis.x.tick.format = function(d, i) {
      //      var d = d < 10 ? '0' + d : d;
      //      return d + ':00';
      //  }
      // }
      // if($scope.by === 'day') {
      //  timeChart.options.axis.x.type = 'timeseries';
      //  timeChart.options.axis.x.label.text = 'Dia';
      //  timeChart.options.axis.x.tick.format = '%d %b';
      //  //timeChart.options.data.type = 'area-spline';
      // }
      // if($scope.by === 'month') {
      //  timeChart.options.axis.x.type = '';
      //  timeChart.options.axis.x.label.text = 'Mês';
      //  timeChart.options.axis.x.tick.format = function(d, i) {
      //    return d;
      //  };
      // }
      // if($scope.by === 'week') {
      //  timeChart.options.axis.x.type = '';
      //  timeChart.options.axis.x.label.text = 'Dia da semana';
      //  timeChart.options.axis.x.tick.format = function(d) {
      //    return moment().isoWeekday(d).format('ddd');
      //  };
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

      $scope.loading = true;

      Resources.get(sourcesParams).$promise.then(function(data) {
        $scope.loading = false;
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

mediavizControllers.controller('CoverageCtrl', function($scope, Page, Resources, Chart, DataFormatter, $location, $timeout) {

  // Multiple keywords, one source; time series for articles and shares


  Page.setTitle('Cobertura');

  var chart;

  $scope.keywords = {};
  $scope.keywords.selected = [];

  $scope.selectedSource = {};
  $scope.selectedSource.selected = '';

  $scope.loadedKeywords = [];

  $scope.dataFormat = 'absolute';

  $scope.selectedNetwork = 'articlesCount';

  $scope.defaultChartType = {type: 'area', name: 'Área 3'};

  $scope.setSocialNetwork = function(socialNetwork) {
    if($scope.selectedNetwork !== socialNetwork) {
      $scope.selectedNetwork = socialNetwork;
      $scope.loadedKeywords = [];
      if(chart) { chart.flush(); }
      getTotalsAndDraw();
    }
  }

  $scope.setChartType = function(chartType) {
    // console.log('triggered', chartType);
    // if(chartType != $scope.chartType.selected) {
      $scope.defaultChartType = chartType;
      if(chart) chart.transform(chartType.type);
      setFlatAreaStyles()
    // }
  }

  function setFlatAreaStyles() {
    if($scope.defaultChartType.name === "Área 3") {
      d3.selectAll('path.c3-line')
        .classed('flat-line', true);
      d3.selectAll('path.c3-area')
        .classed('flat-area', true);

      d3.selectAll('circle.c3-circle')
        .classed('flat-circle', true);
    } else {
      d3.selectAll('path.c3-line')
        .classed('flat-line', false);
      d3.selectAll('path.c3-area')
        .classed('flat-area', false);

      d3.selectAll('circle.c3-circle')
        .classed('flat-circle', false);     
    }    
  }

  $scope.removeFromChart = function(keyword) {
    $scope.keywords.selected.splice($scope.keywords.selected.indexOf(keyword), 1);
    setLocation({keywords: $scope.keywords.selected.toString()})
    if(chart) { chart.unload({ids: keyword}); }
  }

  function setLocation(locationObj) {
    $location.search(angular.extend($location.search(), locationObj));
  }

  $scope.addToChart = function(keyword) {
    $scope.keywords.selected.push(keyword);
    setLocation({keywords: $scope.keywords.selected.toString() })
  }

  $scope.loadSourceData = function(source) {
    setLocation({source: source.acronym});
  }

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var keywords = $location.search()['keywords'] || undefined;
    var source = $location.search()['source'] || undefined;
    if(source) {
      $timeout(function() {
        source = getSourceObjByAcronym($scope.sourceList, source);
        $scope.selectedSource.selected = source;
        if(keywords) {
          $scope.keywords.selected = keywords.split(',');
        }
        if(chart) { chart.unload(); }
        getTotalsAndDraw();
      }, 500);
    }
  }, true);

  function getSourceObjByAcronym(array, acronym) {
    var obj = array.filter(function(el) {
      return el.acronym === acronym;
    });
    return obj[0];
  }

  function getItemData(datum) {
    var dateFormat = d3.time.format("%Y-%m-%d");
    var unformattedDate = datum.x;
    var formattedDate = dateFormat(unformattedDate);
    var query = datum.name;
    var sourceObj = $scope.selectedSource.selected;
    displayItems(formattedDate, query, sourceObj);
  }

  function displayItems(date1, query, source) {
    if(source.group) {
      $location.path('/articles').search({q: query, since: date1, until: date1, type: source.type });
    } else {
      $location.path('/articles').search({q: query, since: date1, until: date1, source: source.name });
    }
    $scope.$apply();
  }

  function getTotalsAndDraw() {
    $scope.keywords.selected.forEach(function(keyword) {
      var keyword = keyword;
      var timeId = 'timeFor' + keyword;
      var countId = keyword;
      var xsObj = {};
      xsObj[countId] = timeId;
      var selectedSource = $scope.selectedSource.selected;
      var aggregated = selectedSource.group;
      if(!aggregated) {
        $scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, source: selectedSource.acronym, q: keyword};
      } else {
        $scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, type: selectedSource.type, q: keyword};
      }
      if($scope.loadedKeywords.indexOf(keyword === -1)) {
        $scope.loading = true;
        Resources.get($scope.paramsObj).$promise.then(function(data) {
          $scope.loading = false;
          if(data.length > 0) {
            $scope.loadedKeywords.push(keyword);
            if($scope.selectedNetwork === 'twitter_facebook') {
              var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'total_shares');
              timeChart.options.axis.y.label.text = 'Partilhas (Twitter + Facebook)';
            } else if ($scope.selectedNetwork === 'twitter') {
              var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'twitter_shares');
              timeChart.options.axis.y.label.text = 'Partilhas (Twitter)';
            } else if ($scope.selectedNetwork === 'facebook') {
              var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'facebook_shares');
              timeChart.options.axis.y.label.text = 'Partilhas (Facebook)';
            } else if ($scope.selectedNetwork === 'articlesCount') {
              var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'articles');
              timeChart.options.axis.y.label.text = 'Número de artigos';
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
            $timeout(function() {
              setFlatAreaStyles();
            }, 0);
          }
        });
};
});
}

var timeChart = {
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
      type: $scope.defaultChartType.type,
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
        padding: {left: 0, right: 0},
        label: {
          text: 'Horas',
          position: 'outer-center'
        },
        tick: {
          fit: true
            // format: function(d, i) {
            //    var d = d < 10 ? '0' + d : d;
            //    return d + ':00';
            // }
          }
        },
        y: {
          //padding: {top: 1, bottom: 1},
          //min: 0,
          label: {
            //text: 'Partilhas (Twitter + Facebook)',
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

mediavizControllers.controller('CompareCtrl', function($scope, $timeout, Page, Resources, Chart, DataFormatter, $location, $routeParams) {

  Page.setTitle('Comparador');

  var chart, chart2;

  $scope.keyword = {};
  $scope.keyword.selected = [];

  $scope.selectedSources = {};
  $scope.selectedSources.selected = [];

  $scope.loadedSources = [];

  $scope.selectDisabled = true;

  $scope.dataFormat = 'absolute';

  $scope.defaultChartType = {type: 'area', name: 'Área 3'};

  $scope.by = $routeParams.by || 'day';
  $scope.since = $routeParams.since;
  $scope.until = $routeParams.until;

  $scope.showSearchTools = true;
  $scope.showSearchToolsNav = false;
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

      $scope.redrawChart();
    }
  }

  $scope.openSearchTools = function() {
    $scope.showSearchToolsNav = !$scope.showSearchToolsNav;
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
    $scope.redrawChart();
  }

  $scope.setChartType = function(chartType) {
    $scope.defaultChartType = chartType;
    if(chart) chart.transform(chartType.type);
    setFlatAreaStyles();
  }

  function setFlatAreaStyles() {
    if($scope.defaultChartType.name === "Área 3") {
      d3.selectAll('path.c3-line')
        .classed('flat-line', true);
      d3.selectAll('path.c3-area')
        .classed('flat-area', true);

      d3.selectAll('circle.c3-circle')
        .classed('flat-circle', true);
    } else {
      d3.selectAll('path.c3-line')
        .classed('flat-line', false);
      d3.selectAll('path.c3-area')
        .classed('flat-area', false);

      d3.selectAll('circle.c3-circle')
        .classed('flat-circle', false);     
    }
  }

  $scope.$watch('keyword.selected', function(newVal, oldVal) {
    if(newVal.length > 2) {
      $scope.selectDisabled = false;
    }
  });

  function getSourceObjByAcronym(array, acronym) {
    var obj = array.filter(function(el) {
      return el.acronym === acronym;
    });
    return obj[0];
  }

  function getSourceObjByName(array, name) {
    var obj = array.filter(function(el) {
      return el.name === name;
    });
    return obj[0];
  }

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var keyword = $location.search()['keyword'] || undefined;
    var sources = $location.search()['sources'] || undefined;
    var byTimeParams = $location.search()['by'] || undefined;
    var formatParams = $location.search()['format'] || undefined;
    var sinceParams = $location.search()['since'] || undefined;
    var untilParams = $location.search()['until'] || undefined;
    $timeout(function() {
      if(keyword) {
        $scope.keyword.selected = keyword;
      }
      if(sources) {
          sources = sources.split(',');
          var newSourcesArray = [];
          sources.forEach(function(el) {
            var sourceObj = getSourceObjByAcronym($scope.sourceList, el);
            newSourcesArray.push(sourceObj);
          });
          $scope.selectedSources.selected = newSourcesArray;
          $scope.redrawChart();
      }
      if(byTimeParams) {
        $location.search(angular.extend($location.search(), {by: byTimeParams.toString()}));
        $scope.by = byTimeParams;
      }
      if(formatParams) {
        $location.search(angular.extend($location.search(), {format: formatParams.toString()}));
        $scope.dataFormat = formatParams;
      }
      if(sinceParams) {
        $location.search(angular.extend($location.search(), {since: sinceParams.toString()}));
        $scope.since = sinceParams;
      }
      if(untilParams) {
        $location.search(angular.extend($location.search(), {until: untilParams.toString()}));
        $scope.until = untilParams;
      }
    }, 500);
  }, true);

  // $scope.groupSourcesByType = function(item) {
  //  if(item.type === 'national') {
  //    return 'Jornais Nacionais';
  //  }
  //  if(item.type === 'international') {
  //    return 'Jornais Internacionais';
  //  }
  //  if(item.type === 'blogs') {
  //    return 'Blogues';
  //  }
  // }

  $scope.loadSourceData = function() {
    //console.log($scope.selectedSources.selected);
    setLocation();
    //getTotalsAndDraw();
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
      $scope.loadedSources.splice(sourceToRemoveIndex, 1);
      columnToRemoveIndex = columns[0].indexOf(sourceToRemove);
      if(columnToRemoveIndex !== -1) {
        columns[0].splice(columnToRemoveIndex, 1);
        columns[1].splice(columnToRemoveIndex, 1);
      }
      if(chart) { chart.unload({ids: sourceToRemove}); }
      // chart2.load({
      //  columns: columns,
      //  unload: [sourceToRemove]
      // });
      }
    });

  $scope.$watch('by', function(newVal, oldVal) {
    if(newVal !== oldVal) {
      $scope.by = newVal;
      $location.search(angular.extend($location.search(), {by: newVal.toString()}));
      if(chart) { chart.unload(); }
      $scope.loadedSources = [];
      getTotalsAndDraw();
    }
  });

  $scope.$watch('dataFormat', function(newVal, oldVal) {
    if(newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {format: newVal.toString()}));
      $scope.loadedKeywords = [];
      if(chart) { chart.flush(); }
      getTotalsAndDraw();
    }
  }, true);

  $scope.$watch('since', function(newVal, oldVal) {
    if(newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {since: newVal.toString()}));
      $scope.loadedSources = [];
      getTotalsAndDraw();
    }
  }, true);

  $scope.$watch('until', function(newVal, oldVal) {
    if(newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {until: newVal.toString()}));
      $scope.loadedSources = [];
      getTotalsAndDraw();
    }
  }, true);


  function setLocation() {
    $location.search({keyword: $scope.keyword.selected});
    var selectedSourcesArray = [];
    if($scope.selectedSources.selected.length > 0) {
      $scope.selectedSources.selected.forEach(function(el) {
        selectedSourcesArray.push(el.acronym);
      });
      if(selectedSourcesArray.length > 0) {
        $location.search(angular.extend($location.search(), { sources: selectedSourcesArray.toString(), by: $scope.by, format: $scope.dataFormat }));
      }
    }
  }

  $scope.setDataFormat = function(dataFormat){
    if ($scope.dataFormat !== dataFormat) {
      $scope.dataFormat = dataFormat;
      $scope.loadedSources = [];
      chart.unload();
      if(chart2) { chart2.unload(); };
      columns = [
      [],[]
      ];
      getTotalsAndDraw();
    }
  }

  $scope.redrawChart = function() {
    setLocation();
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

  function getItemData(datum) {
    var dateFormat = d3.time.format("%Y-%m-%d");
    var unformattedDate = datum.x;
    var formattedDate = dateFormat(unformattedDate);
    var sourceObj = getSourceObjByName($scope.selectedSources.selected, datum.name);
    var query = $scope.keyword.selected
    displayItems(formattedDate, query, sourceObj);
  }

  function displayItems(date1, query, source) {
    if(source.group) {
      $location.path('/articles').search({q: query, since: date1, until: date1, type: source.type });
    } else {
      $location.path('/articles').search({q: query, since: date1, until: date1, source: source.name });
    }
    $scope.$apply();
  }

  function getTotalsAndDraw() {
    $scope.selectedSources.selected.forEach(function(el, index) {

      var keyword = el.name;
      var acronym = el.acronym;
      var aggregated = el.group;
      var timeId = 'timeFor' + keyword;
      var countId = keyword;
      var xsObj = {};
      xsObj[countId] = timeId;

      if(!aggregated) {
        $scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, source: acronym, q: $scope.keyword.selected};
      } else {
        $scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, type: el.type, q: $scope.keyword.selected};
      }

      if($scope.loadedSources.indexOf(keyword) === -1 && columns[0].indexOf(keyword) === -1) {
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
              timeChart.options.data.xs = xsObj;
              timeChart.options.data.columns = formattedData;
              //timeChart.options.axis.x.type = 'timeseries';
              //timeChart.options.axis.x.label.text = 'Dia';
              //timeChart.options.axis.x.tick.format = '%d %b';
              //timeChart.options.data.type = 'area-spline';
              timeChart.options.data.groups = [];
              chart = Chart.draw(timeChart);
            } else {
              chart.load({
                xs: xsObj,
                columns: formattedData
              });
            }
            $timeout(function() {
              setFlatAreaStyles();
            }, 0);
            // if(!chart2 || chart2.internal.data.targets.length === 0) {
            //  barChart.options.data.x = 'x';
            //  var label = '{"' + $scope.keyword.selected + '": "Artigos com ' + $scope.keyword.selected + '"}';
            //  barChart.options.data.names = JSON.parse(label);
            //  barChart.options.data.columns = columns;
            //  chart2 = Chart.draw(barChart);
            // } else {
            //  chart2.load({
            //    columns: columns
            //  });
            // }

            // Fix c3 issue where the subchart is shown even when set to false
            d3.select("#bar-chart svg").select("g.c3-brush").remove();
          }
        }, function() {
          $scope.loading = false;
          alert('Nenhum resultado encontrado');
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
        names: '',
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
          grouped: true
        },
        data: {
          type: $scope.defaultChartType.type,
          onclick: function (d, i) { console.log(d); getItemData(d) }
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
              //    var d = d < 10 ? '0' + d : d;
              //    return d + ':00';
              // }
            }
          },
          y: {
            min: 0,
            padding: {top: 0, bottom: 0},
            label: {
              text: 'Artigos',
              position: 'outer-middle'
            },
            tick: {}
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

mediavizControllers.controller('ChronicleCtrl', function($scope, $rootScope, $location, $routeParams, $timeout, Page, Resources, Chart, DataFormatter) {

  Page.setTitle('Chronicle');

  var chart;

  var count = 0;

  $scope.loadedKeywords = [];

  $scope.loading = false;

  $scope.searchFields = 'title_summary';

  $scope.fields;

  //$scope.chartCleared = false;

  $scope.sourceType = 'national';

  $scope.since = '' || $routeParams.since;
  $scope.until;

  $scope.dataFormat = 'absolute';

  $scope.loadingQueue = [];

  var selectedQueries = [
  ['fc porto', 'benfica', 'sporting'],
  ['ébola', 'legionella'],
  ['passos coelho', 'antónio costa'],
  ['défice', 'dívida'],
  ['ricardo salgado', 'bes'],
  ['sócrates', 'miguel macedo', 'duarte lima'],
  ['charlie hebdo', 'terrorismo'],
  ['austeridade', 'desemprego']
  ];

  // $scope.chartTypes = [
  //   {type: 'line', name: 'Linhas'},
  //   {type: 'spline', name: 'Linhas 2'},
  //   {type: 'area', name: 'Área'},
  //   {type: 'area-spline', name: 'Área 2'},
  //   {type: 'bar', name: 'Barras'},
  //   {type: 'donut', name: 'Donut'}
  // ];

  $scope.defaultChartType = {type: 'area', name: 'Área 3'};

  // $scope.chartType = {
  //   selected: {type: 'line', name: 'Linhas'}
  // };

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
    var sourceParams = $location.search()['sources'] || undefined;
    var formatParams = $location.search()['format'] || undefined;
    if(sourceParams) {
      $location.search(angular.extend($location.search(), {sources: sourceParams.toString()}));
      $scope.sourceType = sourceParams;
    }
    if(keywordParams) {
      if(keywordParams.split(',').length === 1) {
        keywordArray.push(keywordParams);
      }
      if(keywordParams.split(',').length > 1) {
        keywordArray = keywordParams.split(',');
      }
      $scope.keywords.selected = keywordArray;
    }
    if(formatParams) {
      $location.search(angular.extend($location.search(), {format: formatParams.toString()}));
      $scope.dataFormat = formatParams;
    }
    if(objectIsEmpty(newVal) && !objectIsEmpty(oldVal)) {
      $scope.clearChart();
    }
  }, true);

  $scope.$watch('sourceType', function(newVal, oldVal) {
    if(newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {sources: newVal.toString()}));
      $scope.loadedKeywords = [];
      if(chart) { chart.flush(); }
      getTotalsAndDraw();
    }
  }, true);

  $scope.$watch('dataFormat', function(newVal, oldVal) {
    if(newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {format: newVal.toString()}));
      $scope.loadedKeywords = [];
      if(chart) { chart.flush(); }
      getTotalsAndDraw();
    }
  }, true)

  $scope.$watch('keywords.selected', function(newVal, oldVal) {
    angular.forEach(oldVal, function(keyword) {
      if(newVal.indexOf(keyword) === -1) {
        $scope.loadedKeywords.splice($scope.loadedKeywords.indexOf(keyword), 1);
        chart.unload({ids: keyword});
      }
    });
    if(newVal.length > 0 && newVal !== '') {
      $location.search(angular.extend($location.search(), {keywords: newVal.toString(), format: $scope.dataFormat, sources: $scope.sourceType}));
      getTotalsAndDraw();
    } else {
      $scope.clearChart();
    }

  }, true);

  $scope.$watch('loadingQueue', function(newVal, oldVal) {
    if($scope.loadingQueue.length !== 0) {
      $scope.loading = true;
    } else {
      $scope.loading = false;
    }
  }, true);

  $scope.setChartType = function(chartType) {
    // console.log('triggered', chartType);
    // if(chartType != $scope.chartType.selected) {
      $scope.defaultChartType = chartType;
      if(chart) chart.transform(chartType.type);
      setFlatAreaStyles();
    // }
  }

  function setFlatAreaStyles() {
    if($scope.defaultChartType.name === "Área 3") {
      d3.selectAll('path.c3-line')
        .classed('flat-line', true);
      d3.selectAll('path.c3-area')
        .classed('flat-area', true);

      d3.selectAll('circle.c3-circle')
        .classed('flat-circle', true);
    } else {
      d3.selectAll('path.c3-line')
        .classed('flat-line', false);
      d3.selectAll('path.c3-area')
        .classed('flat-area', false);

      d3.selectAll('circle.c3-circle')
        .classed('flat-circle', false);     
    }
  }

  $scope.redrawChart = function() {
    if(chart) {
      if($scope.searchFields !== 'title_summary') {
        $scope.fields = $scope.searchFields;
      } else {
        $scope.fields = undefined;
      }
      $scope.loadedKeywords = [];
      getTotalsAndDraw();
    }
  }

  $scope.clearChart = function() {
    $location.search('');
    $scope.keywords.selected = [];
    $scope.loadedKeywords = [];
    if(chart) { chart.unload(); }
  }

  $scope.setDataFormat = function(dataFormat){
    if ($scope.dataFormat !== dataFormat) {
      $scope.dataFormat = dataFormat;
    }
  }

  $scope.setSourceType = function(sourceType){
    if ($scope.sourceType !== sourceType) {
      $scope.sourceType = sourceType;
      //$scope.loadedKeywords = [];
      //getTotalsAndDraw();
    }
  }

  $scope.addKeyword = function(item){
    $scope.keywords.selected.push(item);
  }


  function createParamsObj(keyword) {
    if($scope.sourceType === 'all') {
      return {resource: 'totals', q: keyword, since: $scope.since, fields: $scope.fields};
    } else {
      return {resource: 'totals', q: keyword, since: $scope.since, type: $scope.sourceType, fields: $scope.fields};
    }
  }


  function getTotalsAndDraw() {
    angular.forEach($scope.keywords.selected, function(el, index) {
      var keyword = el;
      var timeId = 'timeFor' + keyword;
      var countId = keyword;
      var xsObj = {};

      var paramsObj = createParamsObj(keyword);

      if($scope.loadedKeywords.indexOf(keyword) === -1) {
        $scope.loadingQueue.push(keyword);
        Resources.get(paramsObj).$promise.then(function(dataObj) {
          $scope.loadingQueue.splice($scope.loadingQueue.indexOf(keyword), 1);
          if(dataObj.length > 0) {
            //$scope.loading = false;
            var formattedData;
            xsObj[countId] = timeId;
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
            //$scope.loading = false;
            $timeout(function() {
              chart.unload({ids: keyword});
            }, 500)
            //alert($scope.loadedKeywords);
          }
          if(chart) {
            d3.select('.c3-axis-x-label')
            .attr('transform', 'translate(0, -10)');
          }
          $timeout(function() {
            setFlatAreaStyles();
          }, 0);
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
  if(sourceType === 'all') {
    $location.path('/articles').search({q: query, since: date1, until: date1 });
  } else {
    $location.path('/articles').search({q: query, since: date1, until: date1, type: sourceType });
  }
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
      type: $scope.defaultChartType.type,
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
          padding: {left: 0, right: 0},
          max: new Date(),
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
          min: 0,
          padding: {top: 0, bottom: 0},
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
      color: {
        pattern: colorbrewer.Set1[9]
      }
/*      color: function(d) {
        return d3.scale.category20(d);
      }*/
    }
  }

});

mediavizControllers.controller('ArticlesCtrl', function($scope, $location, $routeParams, Resources, Chart, Page, $timeout) {

  Page.setTitle('Artigos');

  $scope.query;
  $scope.since;
  $scope.until;
  $scope.limit;
  $scope.sourceName;
  $scope.sourceType;

  $scope.loading = false;

  $scope.sourceFilter = '';

  $scope.loadData = function() {
    $location.search({q: $scope.query});
  }

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    $scope.query = $location.search()['q'];
    $scope.since = $location.search()['since'];
    $scope.until = $location.search()['until'];
    $scope.limit = $location.search()['limit'] || 50;
    $scope.sourceName = $location.search()['source'];
    $scope.sourceType = $location.search()['type'];
    $scope.sortOrder = $location.search()['sort'];

    //if($scope.query) {
      getData();
    //}

    // var keywords = $location.search()['keywords'] || undefined;
    // var source = $location.search()['source'] || undefined;
    // if(source) {
    //  $timeout(function() {
    //    source = getSourceObjByAcronym($scope.sourceList, source);
    //    $scope.selectedSource.selected = source;
    //    if(keywords) {
    //      $scope.keywords.selected = keywords.split(',');
    //    }
    //    if(chart) { chart.unload(); }
    //    getTotalsAndDraw();
    //  }, 500);
    // }
  }, true);

  function getData() {
    $scope.loading = true;
    Resources.get({resource: 'items', q: $scope.query, since: $scope.since, until: $scope.until, limit: $scope.limit, type: $scope.sourceType, source: $scope.sourceName, sort: $scope.sortOrder}).$promise.then(function(dataObj) {
      $scope.loading = false;
      $scope.chronicleItems = dataObj;

      $timeout(function() {
        var n = 0;
        dataObj.forEach(function(el) {
          twitter_shares = +el.twitter_shares;
          facebook_shares = +el.facebook_shares;
          if(twitter_shares != 0 || facebook_shares != 0) {
            shareChart.options.bindto = '#index-' + n;
            shareChart.options.data.columns = [
              ['Twiter', twitter_shares],
              ['Facebook', facebook_shares]
            ];
            Chart.draw(shareChart);
          }
          n++;
        });
      }, 100);



    });
  }

    var shareChart = {
    options: {
      bindto: '',
      size: {
        height: 125
      },
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      data: {
        type: 'pie'
      },
      pie: {
        label: {
          format: function(value, ratio, id) {
            return value;
          }
        }
      },
      tooltip: {
        format: {
          title: function(d) {
            return d;
          },
          value: function(value, ratio, id, index) {
            return value + ' (' + (ratio*100).toFixed(1) + '%)';
          }
        }
      },
      legend: {
        show: false
      },
      color: {
        pattern: ['#00ABF0', '#49639E']
      }
    }
  }

});

mediavizControllers.controller('FlowCtrl', function($scope, $location, $routeParams, $timeout, Page, Resources, SourceList, Chart, DataFormatter) {

  Page.setTitle('Fluxo');

  $scope.selectedSources = {};

  $scope.selectedSources.selected = [];

  $scope.by = $location.search()['by'] || 'hour';
  // $scope.since = $routeParams.since;
  // $scope.until = $routeParams.until;
  $scope.sourceData = [];
  $scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since};

  $scope.dataFormat = 'absolute';

  $scope.shareFormat = '';

  $scope.loadedSources = [];

  $scope.loadingQueue = [];

  $scope.defaultChartType = {type: 'area', name: 'Área 3'};

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

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var sources = $location.search()['sources'] || undefined;
    var byTimeParams = $location.search()['by'] || undefined;
    var formatParams = $location.search()['format'] || undefined;
    var sinceParams = $location.search()['since'] || undefined;
    var untilParams = $location.search()['until'] || undefined;
    $timeout(function() {
      if(sources) {
        sources = sources.split(',');
        var newSourcesArray = [];
        sources.forEach(function(el) {
          var sourceObj = getSourceObjByAcronym($scope.sourceList, el);
          newSourcesArray.push(sourceObj);
        });
        $scope.selectedSources.selected = newSourcesArray;
        if(chart) { chart.unload(); }
        $scope.loadedSources = [];
        getTotalsAndDraw();
      }
      if(byTimeParams) {
        $location.search(angular.extend($location.search(), {by: byTimeParams.toString()}));
        $scope.by = byTimeParams;
      }
      if(formatParams) {
        $location.search(angular.extend($location.search(), {format: formatParams.toString()}));
        $scope.dataFormat = formatParams;
      }
      if(sinceParams) {
        $location.search(angular.extend($location.search(), {since: sinceParams.toString()}));
        $scope.since = sinceParams;
      }
      if(untilParams) {
        $location.search(angular.extend($location.search(), {until: untilParams.toString()}));
        $scope.until = untilParams;
      }
    }, 500);
  }, true);

  $scope.setChartType = function(chartType) {
      // console.log('triggered', chartType);
      // if(chartType != $scope.chartType.selected) {
        $scope.defaultChartType = chartType;
        if(chart) chart.transform(chartType.type);
        setFlatAreaStyles()
      // }
    }

  function setFlatAreaStyles() {
    if($scope.defaultChartType.name === "Área 3") {
      d3.selectAll('path.c3-line')
        .classed('flat-line', true);
      d3.selectAll('path.c3-area')
        .classed('flat-area', true);

      d3.selectAll('circle.c3-circle')
        .classed('flat-circle', true);
    } else {
      d3.selectAll('path.c3-line')
        .classed('flat-line', false);
      d3.selectAll('path.c3-area')
        .classed('flat-area', false);

      d3.selectAll('circle.c3-circle')
        .classed('flat-circle', false);     
    }    
  }

  $scope.setDateInterval = function() {
    $scope.since = $scope.dateSince;
    $scope.until = $scope.dateUntil;
    $scope.pickadayOpen = false;
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

  $scope.$watch('loadingQueue', function(newVal, oldVal) {
    if($scope.loadingQueue.length !== 0) {
      $scope.loading = true;
    } else {
      $scope.loading = false;
    }
  }, true);


  $scope.setDataFormat = function(dataFormat){
    if ($scope.dataFormat !== dataFormat) {
      $scope.dataFormat = dataFormat;
      // $scope.shareFormat = '';
      // $scope.loadedSources = [];
      // chart.unload();
      // getTotalsAndDraw();
    }
  }

  $scope.viewShares = function(shareFormat) {
    if($scope.shareFormat !== shareFormat) {
      $scope.shareFormat = shareFormat;
      $scope.loadedSources = [];
      if(chart) { chart.flush(); };
      getTotalsAndDraw();
    }
  }

  $scope.displayBy = function(timePeriod) {
    if(timePeriod != $scope.by) {
      $scope.by = timePeriod;
    }
    $scope.showSearchTools = true;
    if($scope.by === 'month') {
      $scope.since = undefined;
      $scope.until = undefined;
      $scope.dateOptions.selected = $scope.optionsForDateSelect[0];
      $scope.showSearchTools = false;
      $scope.showSearchToolsNav = false;
    }
    // if(chart) { chart.unload(); }
    // $scope.loadedSources = [];
    // getTotalsAndDraw();
  }

  $scope.$watch('by', function(newVal, oldVal) {
    if(newVal !== oldVal) {
      $scope.by = newVal;
      $location.search(angular.extend($location.search(), {by: newVal.toString()}));
      if(chart) { chart.unload(); }
      $scope.loadedSources = [];
      getTotalsAndDraw();
    }
  });

  $scope.$watch('dataFormat', function(newVal, oldVal) {
    if(newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {format: newVal.toString()}));
      $scope.loadedKeywords = [];
      if(chart) { chart.flush(); }
      getTotalsAndDraw();
    }
  }, true);

  $scope.$watch('since', function(newVal, oldVal) {
    if(newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {since: newVal.toString()}));
      $scope.loadedSources = [];
      getTotalsAndDraw();
    }
  }, true);

  $scope.$watch('until', function(newVal, oldVal) {
    if(newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {until: newVal.toString()}));
      $scope.loadedSources = [];
      getTotalsAndDraw();
    }
  }, true);

  $scope.unloadSource = function(source) {
    $scope.selectedSources.selected.splice($scope.selectedSources.selected.indexOf(source), 1);
    getAcronyms();
    if(chart) { chart.unload({ids: source.name})}
  }

  $scope.loadSource = function(source) {
    $scope.selectedSources.selected.push(source);
    getAcronyms();
    //getTotalsAndDraw();
  }

  function getAcronyms() {
    var sourcesArray = [];
    $scope.selectedSources.selected.forEach(function(el) {
      sourcesArray.push(el.acronym);
    });
    setLocation({sources: sourcesArray.toString(), by: $scope.by, format: $scope.dataFormat});
  }

  function setLocation(locationObj) {
    $location.search(angular.extend($location.search(), locationObj));
  }

  function getSourceObjByAcronym(array, acronym) {
    var obj = array.filter(function(el) {
      return el.acronym === acronym;
    });
    return obj[0];
  }

$scope.setDates = function(){
  $scope.loadedSources = [];
  getTotalsAndDraw();
}

function getTotalsAndDraw() {
  angular.forEach($scope.selectedSources.selected, function(el, index) {

    var keyword = el.name;
    var acronym = el.acronym;
    var aggregated = el.group;
    var timeId = 'timeFor' + keyword;
    var countId = keyword;
    var xsObj = {};
    xsObj[countId] = timeId;

    if(!aggregated) {
      $scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, source: acronym};
    } else {
      $scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, type: el.type};
    }

    if($scope.loadedSources.indexOf(keyword) === -1) {
      $scope.loadingQueue.push(keyword);
      Resources.get($scope.paramsObj).$promise.then(function(data) {
        $scope.loadingQueue.splice($scope.loadingQueue.indexOf(keyword), 1);
        $scope.loadedSources.push(keyword);
        timeChart.options.data.type = 'area';
        timeChart.options.axis.x.padding = {left: 0, right: 0};
        timeChart.options.axis.y.label.text = 'Número de artigos';
        if($scope.dataFormat === 'absolute') {
          if($scope.shareFormat === '') {
            var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'articles');
          } else {
            var formattedData = getShareData($scope.shareFormat);
            timeChart.options.axis.y.label.text = 'Número de partilhas';
            //timeChart.options.data.type = 'bar';
            //timeChart.options.axis.x.padding = {left: 1, right: 1};
          }

          //timeChart.options.data.groups = [$scope.loadedSources];
          timeChart.options.axis.y.tick.format = function(d, i) {
            return d;
          }
        }
        if($scope.dataFormat === 'relative') {
          if(aggregated) {
            if($scope.shareFormat === '') {
              var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'percent_of_type');              
            } else {
              var formattedData = getShareData($scope.shareFormat);
            }
          } else {
            if($scope.shareFormat === '') {
              var formattedData = DataFormatter.inColumns(data, keyword, 'time', 'percent_of_source');              
            } else {
              var formattedData = getShareData($scope.shareFormat);
            }
          }
          $scope.shareFormat === '' ? timeChart.options.axis.y.label.text = 'Percentagem do total de artigos' : timeChart.options.axis.y.label.text = 'Percentagem do total de partilhas'
          // timeChart.options.axis.y.label.text = 'Percentagem do total de artigos';
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

          function getShareData(shareFormat) {
            var formattedData;
            if(shareFormat === 'all_shares') {
              if($scope.dataFormat === 'absolute') {  
                formattedData = DataFormatter.inColumns(data, keyword, 'time', 'total_shares');
              } else if($scope.dataFormat === 'relative'){
                formattedData = DataFormatter.inColumns(data, keyword, 'time', 'total_shares_percent');                
              }
            } else if(shareFormat === 'twitter_shares') {
              if($scope.dataFormat === 'absolute') {  
                formattedData = DataFormatter.inColumns(data, keyword, 'time', 'twitter_shares');
              } else if($scope.dataFormat === 'relative'){
                formattedData = DataFormatter.inColumns(data, keyword, 'time', 'twitter_shares_percent');                
              }
            } else if(shareFormat === 'facebook_shares') {
              if($scope.dataFormat === 'absolute') {  
                formattedData = DataFormatter.inColumns(data, keyword, 'time', 'facebook_shares');
              } else if($scope.dataFormat === 'relative'){
                formattedData = DataFormatter.inColumns(data, keyword, 'time', 'facebook_shares_percent');                
              }
            }
            return formattedData;
          }

          $timeout(function() {
            setFlatAreaStyles();
          }, 0);

        });
}


});
}

function getSourceObjByName(array, name) {
  var obj = array.filter(function(el) {
    return el.name === name;
  });
  return obj[0];
}

function getItemData(datum) {
    //var dateFormat = d3.time.format("%Y-%m-%d");
    //var unformattedDate = datum.x;
    //var formattedDate = dateFormat(unformattedDate);
    var source = datum.name;
    var sourceObj = getSourceObjByName($scope.selectedSources.selected, source);
    displayItems(sourceObj);
  }

  function displayItems(source) {
    if(source.group) {
      $location.path('/articles').search({type: source.type });
    } else {
      $location.path('/articles').search({source: source.acronym });
    }
    $scope.$apply();
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
            //    var d = d < 10 ? '0' + d : d;
            //    return d + ':00';
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

mediavizControllers.controller('StacksCtrl', function($scope, $location, $timeout, Resources, Chart, DataFormatter, Page) {

  Page.setTitle('Stacks');

  $scope.since = $location.search()['since'];
  $scope.until = $location.search()['until'];


  $scope.keywords = {};
  $scope.keywords.selected = [];

  $scope.selectedSource = {};
  $scope.selectedSource.selected = '';

  $scope.loadedKeywords = [];

  $scope.chartData = '';

  $scope.dataFormat = 'all';

  var chart;

  $scope.setDataFormat = function(dataFormat) {
    if(dataFormat !== $scope.dataFormat) {
      $scope.dataFormat = dataFormat;
      //getTotalsAndDrawChart();
      getTotalsAndDraw();
    }
  }

  $scope.loadSourceData = function(source) {
    setLocation({source: source.acronym});
  }

  $scope.addToChart = function(keyword) {
    $scope.keywords.selected.push(keyword);
    setLocation({keywords: $scope.keywords.selected.toString() })
  }

  $scope.removeFromChart = function(keyword) {
    $scope.keywords.selected.splice($scope.keywords.selected.indexOf(keyword), 1);
    setLocation({keywords: $scope.keywords.selected.toString()});
    if(!$scope.keywords.selected.length) {
      $scope.keywords.selected.push('no keyword');
      // getTotalsAndDrawChart();
      getTotalsAndDraw();
    }
    // getTotalsAndDraw();
    //if(chart) { chart.unload({ids: keyword}); }
  }

  function setLocation(locationObj) {
    $location.search(angular.extend($location.search(), locationObj));
  }

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var keywords = $location.search()['keywords'] || undefined;
    var source = $location.search()['source'] || undefined;
    if(source) {
      $timeout(function() {
        source = getSourceObjByAcronym($scope.sourceList, source);
        $scope.selectedSource.selected = source;
        if(keywords) {
          $scope.keywords.selected = keywords.split(',');
        }
        getTotalsAndDraw();
        // getTotalsAndDrawChart();
      }, 500);
    }
  }, true);

  function getSourceObjByAcronym(array, acronym) {
    var obj = array.filter(function(el) {
      return el.acronym === acronym;
    });
    return obj[0];
  }

  function getTotalsAndDraw() {
    var incomingData = [];
    var keywords = [];
    $scope.keywords.selected.forEach(function(keyword) {
      var keyword = keyword;
      var selectedSource = $scope.selectedSource.selected;
      var aggregated = selectedSource.group;
      if(!aggregated) {
        $scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, source: selectedSource.acronym, q: keyword};
      } else {
        $scope.paramsObj = {resource: 'totals', by: $scope.by, since: $scope.since, until: $scope.until, type: selectedSource.type, q: keyword};
      }
      if($scope.loadedKeywords.indexOf(keyword === -1)) {
        if(keyword === 'no keyword') {
          return $scope.chartData = '';
        };
        $scope.loading = true;
        Resources.get($scope.paramsObj).$promise.then(function(data) {
          if(data.length !== 0) {
            keywords.push(keyword);
            newData = {};
            newData.keyword = keyword;
            newData.counts = data;
/*            data.forEach(function(obj) {
              obj.keyword = keyword
            });*/
            pushData(newData);
            //incomingData.push(data[0]);
            // var count = d3.sum(data.map(function(el) {
            //   return el.articles;
            // }));
            // if(!aggregated) {
            //   var total_count = data[0].total_source_articles;
            // } else {
            //   var total_count = data[0].total_type_articles;
            // }
            // if(incomingData.length === 0) {
            //   incomingData.push({source: selectedSource.name, total_count: total_count});
            // }
            // pushKeywords({name: keyword, count: count});
          } else {
            $scope.loading = false;
          }
        });
      }
      function pushData(data) {
        $scope.loading = false;
        incomingData.push(data);
        if(keywords.length === $scope.keywords.selected.length) {
          $scope.chartData = incomingData;
        }
      }
    });
  }


});

mediavizControllers.controller('WorldMapCtrl', function($scope, $timeout, $location, Resources, Page) {
  Page.setTitle('NewsMap');

  $scope.selectedSource = {};
  $scope.selectedSource.selected = '';

  $scope.keyword = {};
  $scope.keyword.selected = [];

  $scope.optionsForDateSelect = [
    {name: 'Tudo'},
    {name: 'Último dia'},
    {name: 'Últimos 7 dias'},
    {name: 'Últimos 30 dias'},
    {name: 'Intervalo Personalizado'}
  ];

  $scope.dateOptions = [];
  $scope.dateOptions.selected = '';

  $scope.today = moment().format('YYYY-MM-DD');
  $scope.yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
  $scope.oneWeekAgo = moment().subtract(7, 'day').format('YYYY-MM-DD');
  $scope.oneMonthAgo = moment().subtract(30, 'day').format('YYYY-MM-DD');

  $scope.pickadayOpen = false;
  $scope.dateSince = '';
  $scope.dateUntil = '';

  $scope.mapTypes = [
    {type: 'world', name: 'Mundo'},
    {type: 'portugal', name: 'Portugal'}
  ];

  // $scope.lang = 'pt';

  // $scope.selectedMap = null;

  // function setDefaultMap() {
    // $scope.selectedMap = $scope.mapTypes[0];
  if(!$location.search()['map']) {
    $location.search(angular.extend($location.search(), {map: 'world'}));
  }

  if(!$location.search()['lang']) {
    $location.search(angular.extend($location.search(), {lang: 'pt'}));
  }
  // }

  // setDefaultMap();



  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var source = $location.search()['source'] || undefined;
    var mapType = $location.search()['map'] || undefined;
    var keyword = $location.search()['keyword'] || undefined;
    var sinceParams = $location.search()['since'] || undefined;
    var untilParams = $location.search()['until'] || undefined;
    var lang = $location.search()['lang'] || undefined;
      if(lang) {
        $scope.lang = lang;
        $location.search(angular.extend($location.search(), {lang: lang.toString()}));
      }
      if(mapType !== $scope.selectedMap) {
        $scope.selectedMap = $scope.mapTypes.filter(function(el) {
          return el['type'] == mapType;
        })[0];
      }
      if(keyword) {
        $scope.keyword.selected = keyword;
      }
      if(sinceParams) {
        $location.search(angular.extend($location.search(), {since: sinceParams.toString()}));
        $scope.since = sinceParams;
        if($scope.since == $scope.yesterday) {
          $scope.dateOptions.selected = $scope.optionsForDateSelect[1];
        } else if($scope.since == $scope.oneWeekAgo) {
          $scope.dateOptions.selected = $scope.optionsForDateSelect[2];
        } else if($scope.since == $scope.oneMonthAgo) {
          $scope.dateOptions.selected = $scope.optionsForDateSelect[3];
        } else if ($scope.since == undefined) {
          $scope.dateOptions.selected = $scope.optionsForDateSelect[4];
        }
      }
      if(untilParams) {
        $location.search(angular.extend($location.search(), {until: untilParams.toString()}));
        $scope.until = untilParams;
        //getData();
      }
      if(source) {
        $timeout(function() {
          source = getSourceObjByAcronym($scope.sourceList, source);
          $scope.selectedSource.selected = source;
          getMapData();
        }, 500);
      }
  }, true);

  $scope.removeKeyword = function() {
    $scope.keyword.selected = null;
    $location.search('keyword', null);
  }

  $scope.redrawMap = function() {
    if($scope.keyword.selected.length) {
      $location.search(angular.extend($location.search(), {keyword: $scope.keyword.selected.toString()}));
      // $location.search({keyword: $scope.keyword.selected});
    } else {
      $scope.removeKeyword();
    }
  }

  function getSourceObjByAcronym(array, acronym) {
    var obj = array.filter(function(el) {
      return el.acronym === acronym;
    });
    return obj[0];
  }

  function setLocation(locationObj) {
    $location.search(angular.extend($location.search(), locationObj));
  }

  $scope.loadSourceData = function(source) {
    setLocation({source: source.acronym});
  }

  $scope.setDateInterval = function() {
    $scope.since = $scope.dateSince;
    $scope.until = $scope.dateUntil;
    $scope.pickadayOpen = false;
  }

  $scope.setSelectedOption = function(option) {
    //$scope.dateOptions.selected = option;
    if(option.name === $scope.optionsForDateSelect[4].name) {
      $scope.pickadayOpen = !$scope.pickadayOpen;
    } else {
      if(option.name  === $scope.optionsForDateSelect[0].name) {
        $scope.since = undefined;
        $scope.until = undefined;
        $location.search('since', null);
        $location.search('until', null);
      }
      if(option.name  === $scope.optionsForDateSelect[1].name) {
        $scope.since = $scope.yesterday;
        $scope.until = $scope.today;
      }
      if(option.name  === $scope.optionsForDateSelect[2].name) {
        $scope.since = $scope.oneWeekAgo;
        $scope.until = $scope.today;
      }
      if(option.name  === $scope.optionsForDateSelect[3].name) {
        $scope.until = $scope.today;
        $scope.since = $scope.oneMonthAgo;
      }

      $scope.pickadayOpen = false;

      //$scope.loadedSources = [];
      //getTotalsAndDraw();
    }
  }

  $scope.$watch('since', function(newVal, oldVal) {
    if(newVal && newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {since: newVal.toString()}));
      //getData();
    }
  }, true);

  $scope.$watch('until', function(newVal, oldVal) {
    if(newVal && newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {until: newVal.toString()}));
      //getData();
    }
  }, true);

  $scope.changeMap = function() {
    $location.search(angular.extend($location.search(), {map: $scope.selectedMap.type}));
    // getMapData();
  }

  function getMapData() {
    $scope.loading = true;
    var selectedSource = $scope.selectedSource.selected;
    var aggregated = selectedSource.group;
    var query = $scope.keyword.selected || undefined;
    if(!aggregated) {
      $scope.paramsObj = {resource: 'places', since: $scope.since, until: $scope.until, source: selectedSource.acronym, q: query, lang: $scope.lang};
    } else {
      $scope.paramsObj = {resource: 'places', since: $scope.since, until: $scope.until, type: selectedSource.type, q: query, lang: $scope.lang};
    }
    angular.extend($scope.paramsObj, {map: $scope.selectedMap.type});
    Resources.get($scope.paramsObj).$promise.then(function(data) {
      $scope.loading = false;
      $scope.mapData = data;
      // console.log($scope.mapData);
    });
  }


});

mediavizControllers.controller('PhotoFinishCtrl', function($scope, $location, Resources, Page) {

  Page.setTitle('PhotoFinish');

  $scope.$on('CircleData', function(e, data) {
    var dateFormat = d3.time.format("%Y-%m-%d");
    var unformattedDate = new Date(data.first_date);
    var formattedDate = dateFormat(unformattedDate);
    var query = $scope.keyword.selected;
    var source = data.source;
    displayItems(formattedDate, query, source);
  });

  $scope.$on('$routeChangeStart', function() {
    if(!d3.select('.d3-tip').empty()) {
      d3.select('.d3-tip').remove();
    }
  });

  function displayItems(date1, query, source) {
    $location.path('/articles').search({q: query, source: source, sort: 'asc' });
    $scope.$apply();
  }

  $scope.jsonData = [];
  //$scope.since = $location.search()['since'];
  //$scope.until = $location.search()['until'];
  $scope.loading = false;

  $scope.keyword = [];
  $scope.keyword.selected = "";

  $scope.optionsForDateSelect = [
    {name: 'Tudo'},
    {name: 'Último dia'},
    {name: 'Últimos 7 dias'},
    {name: 'Últimos 30 dias'},
    {name: 'Intervalo Personalizado'}
  ];

  $scope.dateOptions = [];
  $scope.dateOptions.selected = '';

  $scope.today = moment().format('YYYY-MM-DD');
  $scope.yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
  $scope.oneWeekAgo = moment().subtract(7, 'day').format('YYYY-MM-DD');
  $scope.oneMonthAgo = moment().subtract(30, 'day').format('YYYY-MM-DD');

  $scope.pickadayOpen = false;
  $scope.dateSince = '';
  $scope.dateUntil = '';


  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var keyword = $location.search()['q'] || undefined;
    var sinceParams = $location.search()['since'] || undefined;
    var untilParams = $location.search()['until'] || undefined;
    if(sinceParams) {
      $location.search(angular.extend($location.search(), {since: sinceParams.toString()}));
      $scope.since = sinceParams;
      if($scope.since == $scope.yesterday) {
        $scope.dateOptions.selected = $scope.optionsForDateSelect[1];
      } else if($scope.since == $scope.oneWeekAgo) {
        $scope.dateOptions.selected = $scope.optionsForDateSelect[2];
      } else if($scope.since == $scope.oneMonthAgo) {
        $scope.dateOptions.selected = $scope.optionsForDateSelect[3];
      } else if ($scope.since == undefined) {
        $scope.dateOptions.selected = $scope.optionsForDateSelect[4];
      }
    }
    if(untilParams) {
      $location.search(angular.extend($location.search(), {until: untilParams.toString()}));
      $scope.until = untilParams;
      //getData();
    }
    if(keyword) {
      $scope.keyword.selected = keyword;
      getData();
    }
  }, true);

  $scope.setDateInterval = function() {
    $scope.since = $scope.dateSince;
    $scope.until = $scope.dateUntil;
    $scope.pickadayOpen = false;
  }

  $scope.setSelectedOption = function(option) {
    //$scope.dateOptions.selected = option;
    if(option.name === $scope.optionsForDateSelect[4].name) {
      $scope.pickadayOpen = !$scope.pickadayOpen;
    } else {
      if(option.name  === $scope.optionsForDateSelect[0].name) {
        $scope.since = undefined;
        $scope.until = undefined;
        $location.search('since', null);
        $location.search('until', null);
      }
      if(option.name  === $scope.optionsForDateSelect[1].name) {
        $scope.since = $scope.yesterday;
        $scope.until = $scope.today;
      }
      if(option.name  === $scope.optionsForDateSelect[2].name) {
        $scope.since = $scope.oneWeekAgo;
        $scope.until = $scope.today;
      }
      if(option.name  === $scope.optionsForDateSelect[3].name) {
        $scope.until = $scope.today;
        $scope.since = $scope.oneMonthAgo;
      }

      $scope.pickadayOpen = false;

      //$scope.loadedSources = [];
      //getTotalsAndDraw();
    }
  }

  $scope.$watch('since', function(newVal, oldVal) {
    if(newVal && newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {since: newVal.toString()}));
      //getData();
    }
  }, true);

  $scope.$watch('until', function(newVal, oldVal) {
    if(newVal && newVal !== oldVal) {
      $location.search(angular.extend($location.search(), {until: newVal.toString()}));
      //getData();
    }
  }, true);

  $scope.redrawChart = function() {
    $location.search(angular.extend($location.search(), {q: $scope.keyword.selected}));
  }

  function getData() {
    $scope.loading = true;
    Resources.get({resource: 'pf', q: $scope.keyword.selected, since: $scope.since, until: $scope.until}).$promise.then(function(data) {
      $scope.jsonData = data;
      $scope.loading = false;
    });
  }

});
