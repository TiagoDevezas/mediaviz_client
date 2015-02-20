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

mediavizControllers.controller('SocialCtrl', function($scope, Page, Resources, Chart, DataFormatter, $location, $timeout) {

  // Multiple keywords, one source; time series for articles and shares


  Page.setTitle('Social');

  var chart;

  $scope.keywords = {};
  $scope.keywords.selected = [];

  $scope.selectedSource = {};
  $scope.selectedSource.selected = '';

  $scope.loadedKeywords = [];

  $scope.dataFormat = 'absolute';

  $scope.selectedNetwork = 'articlesCount';

  $scope.setSocialNetwork = function(socialNetwork) {
    if($scope.selectedNetwork !== socialNetwork) {
      $scope.selectedNetwork = socialNetwork;
      $scope.loadedKeywords = [];
      if(chart) { chart.flush(); }
      getTotalsAndDraw();
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

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var keyword = $location.search()['keyword'] || undefined;
    var sources = $location.search()['sources'] || undefined;
    if(keyword) {
      $scope.keyword.selected = keyword;
    }
    if(sources) {
      $timeout(function() {
        sources = sources.split(',');
        var newSourcesArray = [];
        sources.forEach(function(el) {
          var sourceObj = getSourceObjByAcronym($scope.sourceList, el);
          newSourcesArray.push(sourceObj);
        });
        $scope.selectedSources.selected = newSourcesArray;
        $scope.redrawChart();
      }, 500);
    }
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

  function setLocation() {
    $location.search({keyword: $scope.keyword.selected});
    var selectedSourcesArray = [];
    if($scope.selectedSources.selected.length > 0) {
      $scope.selectedSources.selected.forEach(function(el) {
        selectedSourcesArray.push(el.acronym);
      });
      if(selectedSourcesArray.length > 0) {
        $location.search(angular.extend($location.search(), { sources: selectedSourcesArray.toString() }));
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

  $scope.chartType = 'line';

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

  $scope.$watch('keywords.selected', function(newVal, oldVal) {
    angular.forEach(oldVal, function(keyword) {
      if(newVal.indexOf(keyword) === -1) {
        $scope.loadedKeywords.splice($scope.loadedKeywords.indexOf(keyword), 1);
        chart.unload({ids: keyword});
      }
    });
    if(newVal.length > 0 && newVal !== '') {
      $location.search(angular.extend($location.search(), {keywords: newVal.toString()}));
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
    if(chartType != $scope.chartType) {
      $scope.chartType = chartType;
      if(chart) chart.transform(chartType);
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
      $scope.loadedKeywords = [];
      chart.flush();
      getTotalsAndDraw();
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
      type: $scope.chartType,
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
          padding: {top: 10, bottom: 1},
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
    Resources.get({resource: 'items', q: $scope.query, since: $scope.since, until: $scope.until, limit: $scope.limit, type: $scope.sourceType, source: $scope.sourceName}).$promise.then(function(dataObj) {
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
      $scope.shareFormat = '';
      $scope.loadedSources = [];
      chart.unload();
      getTotalsAndDraw();
    }
  }

  $scope.viewShares = function(shareFormat) {
    if($scope.shareFormat !== shareFormat) {
      $scope.shareFormat = shareFormat;
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
    setLocation({sources: sourcesArray.toString()})
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

  $scope.$watch(function() { return $location.search() }, function(newVal, oldVal) {
    var sources = $location.search()['sources'] || undefined;
    if(sources) {
      $timeout(function() {
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
      }, 500);
    }
  }, true);

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
          }
          else {
            var formattedData = getShareData($scope.shareFormat);
            timeChart.options.axis.y.label.text = 'Partilhas';
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

          function getShareData(shareFormat) {
            var formattedData;
            if(shareFormat === 'all_shares') {
              formattedData = DataFormatter.inColumns(data, keyword, 'time', 'total_shares');
            } else if(shareFormat === 'twitter_shares') {
              formattedData = DataFormatter.inColumns(data, keyword, 'time', 'twitter_shares');
            } else if(shareFormat === 'facebook_shares') {
              formattedData = DataFormatter.inColumns(data, keyword, 'time', 'facebook_shares');
            }
            return formattedData;
          }

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

mediavizControllers.controller('StacksCtrl', function($scope, $location, Resources, Chart) {

  var chart;

  $scope.source = $location.search()['source'];
  $scope.query = $location.search()['q'];
  $scope.since = $location.search()['since'];
  $scope.until = $location.search()['until'];

  getData();

  function getData() {
    Resources.get({resource: 'totals', q: $scope.query, source: $scope.source, since: $scope.since, until: $scope.until}).$promise.then(function(data) {
      var columns = [
        [$scope.query, data[0].total_query_articles],
        ['Outros', data[0].total_source_articles - data[0].total_query_articles]
      ];
      var groups = columns.map(function(el) {
        return el[0];
      });
      stackChart.options.data.columns = columns;
      stackChart.options.data.groups = [groups];
      stackChart.options.axis.y.max = data[0].total_source_articles;
      stackChart.options.axis.x.categories = [$scope.source];
      chart = Chart.draw(stackChart);
    });
  }

  stackChart = {
    options: {
      bindto: '#stack-chart',
      data: {
        type: 'area-step',
      },
      axis: {
        x: {
          type: 'category'
        },
        y: {
          padding: {top: 0, bottom: 0}
        }
      }
    }
  }

});

mediavizControllers.controller('D3Ctrl', function($scope, $location, Resources) {
  $scope.jsonData = [];
  $scope.query = $location.search()['q'];
  $scope.since = $location.search()['since'];
  $scope.until = $location.search()['until'];
  $scope.loading = false;

  getData();

  function getData() {
    $scope.loading = true;
    Resources.get({resource: 'pf', q: $scope.query, since: $scope.since, until: $scope.until}).$promise.then(function(data) {
      $scope.jsonData = data;
      $scope.loading = false;
    });
  }

});


