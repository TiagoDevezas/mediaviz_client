'use strict';

var mediavizDirectives = angular.module('mediavizDirectives', []);

var localized = d3.locale({
  "decimal": ",",
  "thousands": ".",
  "grouping": [3],
  "currency": ["€", ""],
  "dateTime": "%d/%m/%Y %H:%M:%S",
  "date": "%d/%m/%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
  "shortDays": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  "months": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
  "shortMonths": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
});

var tickFormat = localized.timeFormat.multi([
  ["%H:%M", function(d) { return d.getMinutes(); }],
  ["%H:%M", function(d) { return d.getHours(); }],
  ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
  ["%b %d", function(d) { return d.getDate() != 1; }],
  ["%B", function(d) { return d.getMonth(); }],
  ["%Y", function() { return true; }]
]);

mediavizDirectives.directive('c3Chart', function($location) {
  return {
    restrict: 'AE',
    scope: {
      dataset: '=',
      options: '='
    },
    link: function(scope, element, attrs) {
      scope.options = scope.options ? scope.options : {};
      scope.options.data = scope.options.data ? scope.options.data : {};
      scope.options.color = {pattern: colorbrewer.Set1[9]};
      scope.chart = null;

      // Add the c3 class to element for css styling
      angular.element(element).attr('class', 'c3');


      // dataset watcher
      scope.$watch('dataset', function(newVal, oldVal) {
        if(newVal && !scope.chart) {
          scope.addIdentifier();
          scope.options.data.columns = scope.dataset;
          scope.options.data.type = attrs.type;
          scope.chart = c3.generate(scope.options);
        }
        else if(scope.chart) {
          scope.chart.load({columns: newVal});
        }

      });

      scope.$watch(function() { return $location.search()['keywords'] }, function(newVal, oldVal) {
        if(newVal) {
          newVal = newVal.split(',');
          oldVal = oldVal.split(',');
          angular.forEach(oldVal, function(keyword) {
            if(newVal.indexOf(keyword) === -1) {
              scope.chart.unload({ids: keyword});
            }
          });
        } else {
          scope.chart.unload();
        }
      });

      // Add unique id to chart
      scope.addIdentifier = function() {
        scope.dataAttributeChartID = 'chartid' + Math.floor(Math.random() * 1000000001);
        angular.element(element).attr('id', scope.dataAttributeChartID);
        scope.options.bindto = '#' + scope.dataAttributeChartID;
      };
    }
  }
})

mediavizDirectives.directive('loadingFlash', function() {
	return {
		restrict: 'AE',
		transclude: true,
		template: '<div layout="row" ng-show="loading" layout-align="space-around"><md-progress-circular md-mode="indeterminate"></md-progress-circular></div>'
	}
});

mediavizDirectives.directive('selectChartType', function($filter) {
  return {
    restrict: 'AE',
    replace: true,
    link: function(scope, elem, attrs) {
      scope.chartTypes = [
        {type: 'line', name: 'Linhas'},
        {type: 'spline', name: 'Linhas 2'},
        {type: 'area', name: 'Área'},
        {type: 'area-spline', name: 'Área 2'},
        {type: 'bar', name: 'Barras'},
        {type: 'donut', name: 'Donut'}
      ];
      var defaultChartName = scope.defaultChartType.name;
      var foundInTypesArray = $filter('filter')(scope.chartTypes, {name: defaultChartName}, true);
      scope.defaultChartType = foundInTypesArray[0];
      // scope.defaultChartType = scope.chartTypes[0];
      // scope.chartType.selected = scope.chartTypes[0];
      // scope.setChartType = function(chartType) {
      //   scope.chartType.selected = chartType;
      //   if(chart) chart.transform(chartType.type);
      // }
    },
    template: '<select id="chart-type-select" ng-model="defaultChartType" ng-options="chart.name for chart in chartTypes" ng-change="setChartType(defaultChartType)" style="float: left;"></select>'
  };
});

mediavizDirectives.directive('photoFinish', function($window, $parse) {
  return {
    restrict: 'AE',
    template: '',
    link: function(scope, elem, attrs) {

      var d3 = $window.d3;

      //var svg = d3.select('svg');

      //var scopedData = $parse(attrs.chartData);

      var data = attrs.chartData;

      scope.$watch(data, function(newVal, oldVal) {
        data = newVal;
        if(data.length) {
          d3.select('#viz').html('');
          // d3.select('.d3-tip').remove();
          drawChart(data);          
        } else {
          console.log('No data');
        }
      });

      function drawChart(data) {
        console.log(data);
        var margin = {top: 50, right: 50, bottom: 50, left: 100 };
        var width = parseInt(d3.select(elem[0]).style('width')) - margin.left - margin.right;
        var height = ((data.length + 2) * 15);

        // format data
        var dateFormat = localized.timeFormat("%H:%M:%S");

        var monthNameFormat = localized.timeFormat("%e %B %Y");

        var dateTimeFormat = localized.timeFormat("%e de %B de %Y" + " às %X");

        //data.splice(15, data.length);

        var data = d3.shuffle(data);

        data.forEach(function(el) {
          el.name  = el.source
          el.date = new Date(el.first_date);
          el.count = +el.count;
        });

        var dateExtent = d3.extent(data, function(el) {
          return el.date;
        });

        var firstDate = dateExtent[0];

        data.forEach(function(el) {
          el.timeDiff = differenceInHours(el.date);
        });

        //var duration = moment(dateExtent[0]).diff(moment(dateExtent[0]), 'hours');

        function differenceInHours(dateObj) {
          var diff = moment(dateObj).diff(moment(firstDate), 'hours');
          return diff;
        }

        var timeDiffExtent = d3.extent(data, function(el) {
          return el.timeDiff;
        });

        var maxCount = d3.max(data, function(el) {
          return el.count;
        });

        var sources = data.map(function(el) {
          return el.name;
        });

        var topAxisValues = d3.time.days(dateExtent[0], dateExtent[1], 1);

        var uniqueDays = d3.set(data.map(function(el) {
          return monthNameFormat(el.date);
        })).values();

        uniqueDays = uniqueDays.map(function(el) {
          return monthNameFormat.parse(el);
        });

        //console.log(uniqueDays);

        //console.log(topAxisValues);

        sources.push('');

        // Create scales
        xScale = d3.time.scale.utc().domain(dateExtent).range([margin.left / 2, width - margin.right])
          //.nice(d3.time.day);

        x2Scale = d3.scale.linear().domain(timeDiffExtent).range([margin.left / 2, width - margin.right]);
        //yScale = d3.scale.linear().domain([0, maxCount + 1]).range([height, 0]);

        yScale = d3.scale.ordinal().domain(sources).rangeRoundBands([height, 0], 0, 0);

        rScale = d3.scale.linear().domain([0, maxCount]).range([5, 10]);

        // var colorScale = d3.scale.quantize()
        //   .range(colorbrewer.PuBuGn[9])
        //   .domain([0, maxCount]);

        // colorScale = d3.scale.category20();

        // Create x and y axis
        xAxis = d3.svg.axis()
        .scale(xScale)
        //.tickValues(uniqueDays)
        //.ticks(d3.time.days, 1)
        .tickFormat(localized.timeFormat("%e de %b"))
        .orient('top');

        xAxis2 = d3.svg.axis()
          .scale(x2Scale)
          //.tickValues(topAxisValues)
          .tickFormat(function(d) {
            if((+d) !== 0) {
              return "+" + d + " horas";              
            } else {
              return d;
            }
          })
          //.ticks(15)
          .orient('bottom');

        yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickValues(sources)
        .tickSize(-width);

        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return "<p style='text-decoration: underline;'><strong>" + d.source + "</strong></p>" +
            "<p><strong>Primeira notícia publicada em:</strong> <span style='color:red'>" + dateTimeFormat(new Date(d.first_date)) + "</span></p>" +
            "<p><strong>Notícias publicadas:</strong> <span style='color:red'>" + d.count + "</span>";
          });

        var div = d3.select("body").append("div")   
          .attr("class", "tooltip")               
          .style("opacity", 0);

        var svg = d3.select('#viz')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.left)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' +(xScale(firstDate) - margin.left / 2) + ',' + 0 + ')')
        .call(xAxis);

        svg.append('g')
        .attr('class', 'x2 axis')
        .attr('transform', 'translate(' +(xScale(firstDate) - margin.left / 2) + ',' + height + ')')
        .call(xAxis2);


        svg.append('g')
        .attr('class', 'y axis')
        //.attr('transform', 'translate(' + 0 + ',' + 0 + ')')
        .call(yAxis)
        .selectAll('text')
        .attr('y', - yScale.rangeBand() / 2);

        svg.call(tip);

        var finishLine = svg.append('line')
              .attr('class', 'finish')
              .attr('x1', xScale(d3.min(dateExtent.reverse())))
              .attr('y1', height)
              .attr('x2', xScale(d3.min(dateExtent.reverse())))
              .attr('y2', 0)
              .style('opacity', 0);

        //rData = d3.shuffle(data);

        var groups = svg.selectAll('g.news')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'news')
        .attr('transform', function(d) {
          return 'translate(' + 0 + ',' + yScale(d.name) + ')'
        })
        .on('mouseover', highlight)
        .on('mouseout', unHighlight)
        .on('click', function(d) {
          tip.hide;
          scope.$emit('CircleData', d);
        });

        // groups
        //   .append('line')
        //   .attr('x1', function(d) { return xScale(d.date); })
        //   .attr('y1', height)
        //   .attr('x2', function(d) { return xScale(d.date); })
        //   .attr('y2', 0)
        //   .style('fill', 'none')
        //   .style('stroke', '#000');

        groups
            .append('circle')
            .attr('class', 'source')
            .attr('r', 5)
            .attr('transform', 'translate(' + width + ',' + 0 + ')')
            .style('fill', '#c7e9b4')
            .style('opacity', .85);
            
        

        var circles = d3.selectAll('circle.source');

        var t0 = groups
        .transition()
        .duration(2000)
        .ease('cubic out-in')
        //.delay(function(d, i) { return 100 * i})
        .attr('transform', function(d) { 
          return 'translate(' + -(width-xScale(d.date)) + ',' + yScale(d.name) + ')';
        });

        // var t1 = t0.transition()
        // .attr('transform', function(d) { 
        //  return 'translate(' + xScale(d.date) + ',' + yScale(d.count) + ')';
        // });

        var t1 = t0.transition()
        .select('circle.source')
        .attr('r', function(d) { return rScale(d.count);})
        .each('end', drawLabels);

        function drawLabels() {
          var d = this.__data__;
          if (d.date === d3.min(dateExtent)) {
            var mouseOverEvent = document.createEvent('Event');
            mouseOverEvent.initEvent('mouseover', true, true);
            this.parentElement.dispatchEvent(mouseOverEvent);
            //d3.select(this.parentElement).each(highlight);
            //tip.show(d);
          }
          // var parentEl = this.parentElement;
          // d3.select(parentEl)
          // .append('text')
          // .attr('class', 'label')
          // .text(function(d) { return d.name; })
          // .attr('text-anchor', 'middle')
          // .attr('transform', function(d, i) {
          //   return 'translate(' + 0 + ',' + (-rScale(d.count) - 5) + ')'
          // })
          // .classed('highlight winner', function(d) {
          //   if(d.date === d3.min(dateExtent)) {
          //     return true;
          //   }
          // });
          // d3.select(this.parentElement)
          // .classed('highlight winner', function(d) {
          //   console.log(this.parentElement, d);
          //   if(d.date === d3.min(dateExtent)) {
          //     tip.show();
          //     return true;
          //   }
          // });
          drawFinishLine();
        }

        function drawFinishLine() {
          finishLine
            .style('opacity', 1);
        }

        function highlight() {
          var d = this.__data__;
          tip.show(d);
          var parentEl = this.parentElement;
          d3.select(this).select('circle.source')
            .classed('highlight', true);
          // d3.select(this).select('text.label')
          //   .classed('highlight', true);
          if(d.date == firstDate) {
            d3.select(this).select('circle.source')
              .classed('highlight', false)
              .style('stroke', 'red')
              .style('stroke-width', '2px')
          }
          parentEl.appendChild(this);
          if(d3.select('line.guide').empty() && d.date !== firstDate) {
            svg
              .append('line')
              .attr('class', 'guide')
              .attr('x1', function() { return xScale(d.date); })
              .attr('y1', 0)
              .attr('x2', function() { return xScale(d.date); })
              .attr('y2', height)
              .style('fill', 'none')
              .style('stroke', '#000');
          }
        }

        function unHighlight() {
          tip.hide();
          if(!d3.select('line.guide').empty()) {
            d3.select('line.guide').remove();
          }
          d3.select(this).select('circle.source')
          .classed('highlight', false)
          d3.select(this).select('text.label')
          .classed('highlight', false)
        }
      }
    }
  }
});

mediavizDirectives.directive('stacksChart', function($window) {
  return {
    restrict: 'AE',
    template: '',
    scope: {
      chartData: '=',
      viewMode: '@'
    },
    link: function(scope, elem, attrs) {
      var d3 = $window.d3;

      scope.$watch('chartData', function(newVal, oldVal) {
        var mode = scope.viewMode;
        var data = newVal;
        if(data.length) {
          //svg.style('opacity', '1');
          scope.render(data, mode);          
        } else {
          console.log('No data');
          //svg.style('opacity', '0');
        }
      }, true);

      // Set dimensions

      var margin = {top: 25, right: 100, bottom: 25, left: 50 };
      var width = 960 - margin.left - margin.right;
      var height = 500 - margin.top - margin.bottom;

      // Create parent SVG

      var svg = d3.select(elem[0])
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.left)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


      // Create scales

      var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, width]);

      var yScale = d3.scale.linear()
        .rangeRound([height, 0]);

      var colorScale = d3.scale.category20();

      // Create axes

      var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom');

      var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

      // Generate axes

      svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(' + 0 + ',' + height + ')');

      svg.append('g')
          .attr('class', 'y axis');

      scope.render = function(incomingData, vizMode) {

        // Get keyword data

        var newData = incomingData;

        var keywords = newData[0].keywords;

        var totalCount = newData[0].total_count;

        var keywordTotalCount = d3.sum(keywords.map(function(el) {
          return el.count;
        }));

        // Transform data

        newData[0].keywords.sort(function(a, b) {
          return d3.ascending(a.count, b.count);
        });

        newData.forEach(function(d, i) {
          var y0 = 0;
          d.total = d.total_count;
          d.counts = d.keywords.map(function(el) {
            return({name: el.name, y0: y0, y1: y0 += +el.count});
          });
        });

        var sum = 0;
        var counts = keywords.map(function(el) {
          sum = el.count + sum;
          return sum;
        });

        if(vizMode === 'all') {
          counts.push(totalCount);
          yScale
            .domain([0, totalCount]);
        } else if(vizMode === 'selected') {
          yScale
            .domain([0, keywordTotalCount]);
        }

        //counts.push(totalCount);
        counts.unshift(0);

        var keywordCounts = newData.map(function(el) {
          return el.counts;
        })[0];

        xScale
          .domain(newData.map(function(d) { return d.source}));


        yAxis
          .tickValues(counts);

        //svg.selectAll('g.axis').remove();

        svg.select('rect.background').remove();

        //svg.selectAll('g.band').remove();

        // svg.append('g')
        //   .attr('class', 'x axis')
        //   .attr('transform', 'translate(' + 0 + ',' + height + ')')
        //   .call(xAxis);

        // svg.append('g')
        //   .attr('class', 'y axis')
        // //.attr('transform', 'translate(' + 0 + ',' + 0 + ')')
        //   .call(yAxis);

       svg.append('rect')
          .attr('class', 'background')
          //.attr('transform', "translate(0,0)")
          .attr('width', xScale.rangeBand())
          .attr('height', height)
          .style('fill', 'lightgray');

      var bands = svg.selectAll('g.band')
          .data(keywordCounts, function(d) {
            return d.name + d.count;
          });

      var bandsEnter = bands
          .enter().append('g')
          .attr('class', 'band');

      bandsEnter
          .append('rect')
          .attr('y', -height)
          //.attr('class', 'band')
          .attr('width', xScale.rangeBand())
          .attr('height', function(d) {return yScale(d.y0) - yScale(d.y1);})
          .style("fill", function(d) { return colorScale(d.name); });

      bandsEnter
        .append('text')
        .attr('class', 'label')
        //.attr('text-anchor', 'middle')
        .attr('transform', function(d) {
          return 'translate(' + (width + 6) + ',' + (((yScale(d.y0) + yScale(d.y1)) / 2) + 2) + ')'
        })
        //.attr('x', -6)
        //.attr('y', function(d) { return yScale(d.y0); })
        .text(function(d) { return d.name + ' (' + (d.y1-d.y0) + ')' })
        .style('font', '10px sans-serif')
        .style('fill', 'black')
        .style('opacity', 1);

      var bandsUpdate = bands.transition()
          .duration(500)
          .attr('y', function(d) { return yScale(d.y1); })
          //.each('end', drawLabels);
        // .attr('transform', function(d) {
        //   'translate(' + 0 + ',' + yScale(d.y1) + ')';
        // });

      bandsUpdate.select('rect')
        .attr('height', function(d) {return yScale(d.y0) - yScale(d.y1);})
        .attr('y', function(d) { return yScale(d.y1); });

      bandsUpdate.select('text.label')
        .attr('transform', function(d) {
            return 'translate(' + (width + 6) + ',' + (((yScale(d.y0) + yScale(d.y1)) / 2) + 2) + ')'
          })
        .text(function(d) { return d.name + ' (' + (d.y1-d.y0) + ')' });

      var bandsExit = bands.exit();

      bandsExit
        .select('text.label')
        .style('opacity', '0');

      bandsExit
        .transition()
        .duration(200)
        .attr('height', 0)
        .remove();

      d3.transition(svg).select(".x.axis")
        .call(xAxis);

      d3.transition(svg).select(".y.axis")
        .call(yAxis);

      }

    }
  }
});

mediavizDirectives.directive('stacksChart2', function($window) {
  return {
    restrict: 'AE',
    template: '',
    // scope: {
    //   chartData: '='
    // },
    link: function(scope, elem, attrs) {
      var d3 = $window.d3;

      // Watcher

      var data = attrs.chartData;

      scope.$watch(data, function(newVal, oldVal) {
        var incomingData = newVal;
        if(incomingData.length) {
          d3.select('#viz').html('');
          //console.log(incomingData);
          scope.render(incomingData);
        } else {
          d3.select('#viz').html('');
        }
      });

      scope.render = function(data) {

        // Set parent SVG dimensions
        var margin = {top: 25, right: 100, bottom: 25, left: 50 };
        var width = parseInt(d3.select(elem[0]).style('width')) - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

        var dateTimeFormat = localized.timeFormat("%e de %B de %Y");

        var percentFormat = d3.format(".0%");

        // Create parent SVG

        var svg = d3.select(elem[0])
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.left)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Create scales

        var xScale = d3.time.scale()
          .range([0, width]);

        var yScale = d3.scale.linear()
          .range([height, 0]);

        var allKeywords = data.map(function(d) { return d.keyword; });

        var colorScale = d3.scale.ordinal()
          .range(colorbrewer.Set1[9])
          .domain(allKeywords);


        // var colorScale = d3.scale.category20();

        // Create axes

        var xAxis = d3.svg.axis()
          .scale(xScale)
          .tickFormat(localized.timeFormat("%e de %b"))
          .orient('bottom');

        var yAxis = d3.svg.axis()
          .scale(yScale)
          .tickFormat(percentFormat)
          .orient('left');

        // Generate axes

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(' + 0 + ',' + height + ')');

        svg.append('g')
            .attr('class', 'y axis');

        //renderGraph(dummyData);


        var keywords = data;

        console.log(keywords);

        var keywordObjLength = 0;

        // var stack = d3.layout.stack()
        //   .values(function(d) { return d.counts; })
        //   //.x(function(d) { return new Date(Date.parse(d.time)); })
        //   .y(function(d) { return +d.articles; });

        // var stacked = stack(keywords);

        //console.log(stacked);

        var allDates = [];

        keywords.forEach(function(keyword) {
          keyword.counts.forEach(function(el) {
            allDates.push(el.time);
          });
        });

        allDates = d3.set(allDates).values();

        // allDates = d3.set(allDates).values();

        // console.log(allDates, allDates.length, keywords);

        keywords.forEach(function(keyword) {
          var datesArray = keyword.counts.map(function(c) {
            return c.time;
          });
          allDates.forEach(function(dateString) {
            if(datesArray.indexOf(dateString) > -1) {
              return;
            } else {
              keyword.counts.push({time: dateString, articles: 0})
            }
          });
        });

        keywords.forEach(function(keyword) {
          keyword.counts.sort(function(a, b) {
            if(Date.parse(a.time) > Date.parse(b.time)) {
              return 1;
            }
            if(Date.parse(a.time) < Date.parse(b.time)) {
              return -1;
            }
            return 0;
          });
          keyword.values = keyword.counts.map(function(p, i) {
            var yValue = p.articles !== 0 ? (p.articles/p.total_articles_for_day) : 0;
            var maxValue = p.total_articles_for_day !== 0 ? (p.total_articles_for_day/p.total_articles_for_day) : 0;
            return { x: Date.parse(p.time), y: yValue, y0: 0, keyword: keyword.keyword, dayCount: maxValue, count: p.articles, countForDay: p.total_articles_for_day}
          }); 
        })

        // keywords.forEach(function(keyword, i) {
        //   keyword.counts.forEach(function(obj) {
        //     allDates.forEach(function(dateString) {
        //       if(Date.parse(obj.time) === dateString)
        //     })
        //     // if (d3.set(allDates).has(Date.parse(obj.time))) {
        //     //   console.log('Has time');
        //     // } else {
        //     //   console.log('Hasn\'t time');
        //     // }
        //   });
        // });

        // keywords.forEach(function(d, index) {
        //   if(d.counts.length >= keywordObjLength) {
        //     keywordObjLength = d.counts.length;
        //   } else if(d.counts.length < keywordObjLength) {
        //     // console.log('Object length is smaller', d.counts.length);
        //     while(d.counts.length !== keywordObjLength) {
        //       console.log('looping');
        //       d.counts.push({time: new Date(), articles: 0});
        //     }
        //   }
          // d.values = d.counts.map(function(p, i) {
          //   return { x: Date.parse(p.time), y: p.articles, y0: 0, keyword: d.keyword}
          // }); 
        // });

        var stack = d3.layout.stack()
          .offset("zero")
          .values(function(d) { return d.values; });

        var layers = stack(keywords);

        // console.log(layers);


        // keywords.forEach(function(d) {
        //   var y0 = 0;
        //   d.counts.forEach(function(count) {
        //     count.time = new Date(Date.parse(count.time));
        //     count.y0 = y0;
        //     count.y1 = y0 += count.articles;
        //     count.keyword = d.keyword;
        //   });
        //   // d.counts = d.counts.map(function(el) {
        //   //   return ({time: el.time, y0: y0, y1: y0 += +el.articles})
        //   // });
        //   d.total = d.counts[d.counts.length -1].y1;
        // })
        
        var allDates = [];

        layers.forEach(function(obj) {
          obj.values.forEach(function(v) {
            //allDates.push(new Date(Date.parse(count.time)));
            allDates.push(v.x);
          });
        });

        allDates.push(moment(allDates[allDates.length-1]).add(1, 'days'));

        // allDates.push(moment(allDates[-1]).add(1, 'days'));

        var dateExtent = d3.extent(allDates);


        var maxCount = d3.max(layers, function(d) {
          return d3.max(d.values, function(v) {
            return v.dayCount;
          });
        });

        // console.log(dateExtent, maxCount);

        // var maxCount = d3.max(keywords, function(d) { return d.total; })
        // // var dateExtent = d3.extend(keywords.forEach(function(keyword.counts) {
        // //   return new Date(Date.parse(keyword.counts.time))
        // // }));

        // // var nest = d3.nest()
        // //   .key(function(d) { return d.time; })
        // //   .entries(incomingData);

        // // incomingData.forEach(function(obj) {
        // //   dates.push(obj.time);
        // // });

        // // nest.forEach(function(d, i) {
        // //   var y0 = 0;
        // //   d.counts = d.values.map(function(el) {
        // //     return ({keyword: el.keyword, time: el.time, y0: y0, y1: y0 += el.articles});
        // //   });
        // // });

        // // var articleMax = d3.max(incomingData, function(obj){
        // //   return obj.articles;
        // // });


        xScale
          .domain(dateExtent);
          // .nice(d3.time.day, 2);

        yScale.domain([0, maxCount]);

        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return "<p style='text-decoration: underline;'><strong>" + d.keyword + "</strong></p>" +
            "<p><strong>Data:</strong> <span style='color:red'>" + dateTimeFormat(new Date(d.x)) + "</span></p>" +
            "<p><strong>Notícias:</strong> <span style='color:red'>" + d.count + " de " + d.countForDay + " (" + percentFormat(d.y) + ")" + "</span>";
          });

        svg.select('.x.axis')
          .call(xAxis);

        svg.select('.y.axis')
          .call(yAxis);

        svg.call(tip);

        // var area = d3.svg.area()
        //   .interpolate('step')
        //   .x(function(d) { return xScale(d.x); })
        //   .y0(function(d) { return yScale(d.y0); })
        //   .y1(function(d) { return yScale(d.y0 + d.y); });

        // svg.selectAll(".layer")
        // .data(layers)
        // .enter().append("path")
        // .attr("class", "layer")
        // .attr("d", function(d) { return area(d.values); })
        // .style("fill", function(d) { return colorScale(d.keyword); });

        // var allCounts = [];

        // keywords.forEach(function(kw) {
        //   kw.counts.forEach(function(el) {
        //     allCounts.push(el);
        //   });
        // });

        var gLayers = svg.selectAll('g.layer')
          .data(layers)
          .enter().append('g')
          .attr('class', 'layer')
          //.attr("transform", function(d) { return "translate(" + xScale(d.time) + ",0)"; });
          //.attr("transform", function(d) { return "translate(" + xScale(d.time) + ",0)"; });

        gLayers.selectAll('rect')
          .data(function(d, i) { return d.values; })
          .enter().append('rect')
          .attr('class', 'bar')
          .attr('x', function(d) { return xScale(d.x); })
          .attr('width', function() { return width / layers[0].values.length})
          .attr('y', function(d) { return yScale(d.y0) - (height - (yScale(d.y))); })
          .attr('height', function(d) { return height - (yScale(d.y)); })
          .style('fill', function(d) { return colorScale(d.keyword); })
          .on('mouseover', function(d, i) { highlightAndShowTip(d); })
          .on('mouseout', function(d, i) { unHighlightAndHideTip(d); });

        function highlightAndShowTip(d) {
          tip.show(d);
          d3.selectAll('rect.bar')
            .style('fill', function(datum) {
              if(d.x === datum.x && d.y0 === datum.y0) {
                return d3.hsl(colorScale(datum.keyword)).darker(1.5);
              } else {
                return colorScale(datum.keyword);
              }
            })
            .style('opacity', function(datum) {
              if(d.x === datum.x && d.y0 === datum.y0) {
                return 1;
              } else {
                return 0.15;
              }
            });
        }

        function unHighlightAndHideTip(d) {
          tip.hide();
          d3.selectAll('rect.bar')
            .style('opacity', 1);
          d3.selectAll('rect.bar')
            .style('fill', function(datum) {
              return colorScale(datum.keyword);
            });
        }


        var legend = svg.selectAll(".legend")
              .data(colorScale.domain().slice().reverse())
            .enter().append("g")
              .attr("class", "legend")
              .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

          legend.append("rect")
              .attr('class', 'legend')
              .attr("x", width + margin.right - 20)
              .attr("width", 18)
              .attr("height", 18)
              .style("fill", colorScale);

          legend.append("text")
              .attr("x", width + margin.right - 26)
              .attr("y", 9)
              .attr("dy", ".35em")
              .style("text-anchor", "end")
              .text(function(d) { return d; });
        // gLayers
        //     .append('rect')
        //     //.attr('x', function(d) { return xScale(new Date(Date.parse(d.time))); })
        //     .attr('x', function(d,i) { console.log(d, d.counts, d.counts[i]); return xScale(d.counts[i].x); })
        //     .attr('width', 5)
        //     .attr('y', function(d, i) { return yScale(d.counts[i].y); })
        //     .attr('height', function(d, i) { return yScale(d.counts[i].y0) - yScale(d.counts[i].y); })
            //.attr('fill', function(d) { return colorScale(d.keyword); });

/*        bandsEnter.each(function(d, i) {
          d3.select(this)
          .selectAll('rect.stack')
          .data(d.counts)
          .enter()
          .append('rect')
          .attr('width', xScale.rangeBand())
          .attr('y', function(d) { return yScale(d.y1);})
          .attr('height', function(d) {return yScale(d.y0) - yScale(d.y1)})
          .style("fill", function(d) { return colorScale(d.keyword); });
        })*/

        // bandsEnter
        //   .append('rect')
        //   .attr('width', xScale.rangeBand())
        //   .attr('height', function(d, i) {console.log(d.counts[i]); return yScale(d.y0) - yScale(d.y1)})
        //   .attr('y', function(d) { return yScale(d.y1);})
        //   .style("fill", function(d) { return colorScale(d.keyword); });



      }


    }


  }
});