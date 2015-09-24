mediavizDirectives.directive('c3Chart', function($location) {
  return {
    restrict: 'AE',
    scope: {
      dataset: '=',
      options: '=',
      xs: '='
    },
    link: function(scope, element, attrs) {
      scope.options = scope.options ? scope.options : {};
      scope.options.data = scope.options.data ? scope.options.data : {};
      scope.options.data.xs = scope.xs ? scope.xs : {};
      scope.options.data.type = attrs.type;
      scope.options.color = {pattern: colorbrewer.Dark2[8]};

      var chart = null;

      // Add the c3 class to element for css styling
      angular.element(element).attr('class', 'c3');


      // dataset watcher
      scope.$watchCollection('dataset', function(data) {
        createChart(data);
      }, true);

      function createChart(data) {
        if(data && !chart) {
          addIdentifier();
          scope.options.data.columns = scope.dataset;
          if(scope.xs) {
            scope.options.data.xs = scope.xs
          }
          chart = c3.generate(scope.options);
        }
        if(data && chart) {
          if(scope.xs) {
            chart.load({xs: scope.xs, columns: data});
          } else {
            chart.load({columns: data});
          }
        }
        if((!data || !data.length) && chart) {
          chart.unload();
        }
      }

      // Event watchers

      scope.$on('sourceRemoved', function(evt, source) {
        if(chart) chart.unload({ids: source});
      });

      scope.$on('unloadAll', function(evt) {
        if(chart) chart.unload();
      });

      scope.$on('updateMaxY', function(evt, value) {
        if(chart && chart.internal.config.data_type === 'bar') {
          chart.axis.max({y: value});
        }
      });

      scope.$on('flushChart', function(evt) {
        if(chart) chart.flush();
      });

      scope.$on('destroyChart', function(evt) {
        if(chart) chart.destroy();
      });

      scope.$on('changeXAxisFormat', function(evt, options) {
        if(chart) {
          chart.internal.config.axis_x_tick_format = options.format;
          chart.internal.config.axis_x_type = options.type;
        }
      });

      
      // Keyword watcher

      if(attrs.watchParams) {
        scope.$watch(function() { return $location.search()[attrs.watchParams] }, function(newVal, oldVal) {
          if(newVal && oldVal && chart) {
            var newSources = newVal.split(',');
            var oldSources = oldVal.split(',');
            angular.forEach(oldSources, function(keyword) {
              if(newSources.indexOf(keyword) === -1) {
                chart.unload({ids: keyword});
              }
            });
          } else if(chart){
            chart.unload();
          }
        }, true);
      }

      // Add unique id to chart
      function addIdentifier() {
        scope.dataAttributeChartID = 'chartid' + Math.floor(Math.random() * 1000000001);
        angular.element(element).attr('id', scope.dataAttributeChartID);
        angular.element(element).attr('class', 'chart-container');
        scope.options.bindto = '#' + scope.dataAttributeChartID;
      };
    }
  }
});