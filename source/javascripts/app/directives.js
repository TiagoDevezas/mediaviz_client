'use strict';

var mediavizDirectives = angular.module('mediavizDirectives', []);

mediavizDirectives.directive('loadingFlash', function() {
	return {
		restrict: 'AE',
		transclude: true,
		template: '<div class="flash-notice" ng-show="loading" style="background-color: #2980B9;"><p><img src="images/svg-loaders/oval.svg" width="50" /><p><span ng-transclude style="color: #fff;"></span></div>'
	}
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
          drawChart(data);          
        } else {
          console.log('No data');
        }
      });

      function drawChart(data) {
        var margin = {top: 50, right: 50, bottom: 50, left: 100 };
        var width = 960 - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

        // format data
        var dateFormat = d3.time.format("%H:%M:%S");

        data.splice(15, data.length);

        var data = d3.shuffle(data);

        data.forEach(function(el) {
          el.name  = el.source
          el.date = new Date(el.first_date);
          el.count = +el.count;
        });

        var dateExtent = d3.extent(data, function(el) {
          return el.date;
        });

        var maxCount = d3.max(data, function(el) {
          return el.count;
        });

        var sources = data.map(function(el) {
          return el.name
        });

        sources.push('');

        // Create scales
        xScale = d3.time.scale.utc().domain(dateExtent.reverse()).range([margin.left / 2, width - margin.right])
          .nice(d3.time.hour);
        //yScale = d3.scale.linear().domain([0, maxCount + 1]).range([height, 0]);

        yScale = d3.scale.ordinal().domain(sources).rangeRoundBands([height, 0], 0, 0);

        rScale = d3.scale.linear().domain([0, maxCount]).range([5, 10]);

        colorScale = d3.scale.category20();

        // Create x and y axis
        xAxis = d3.svg.axis()
        .scale(xScale)
        //.tickFormat(dateFormat)
        .orient('bottom');

        yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickValues(sources)
        .tickSize(-width);

        var svg = d3.select('#viz')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.left)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + 0 + ',' + height + ')')
        .call(xAxis);


        svg.append('g')
        .attr('class', 'y axis')
        //.attr('transform', 'translate(' + 0 + ',' + 0 + ')')
        .call(yAxis)
        .selectAll('text')
        .attr('y', - yScale.rangeBand() / 2);

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
        .on('mouseout', unHighlight);

        groups.each(function(d, i) {
          d3.select(this)
          .append('circle')
          .attr('class', 'source')
          .attr('r', 5)
          .style('fill', function(d, i) { return colorScale(d.name); })
          .style('opacity', .85);
        });

        var circles = d3.selectAll('circle.source');

        var t0 = groups
        .transition()
        .duration(2000)
        .ease('cubic out-in')
        //.delay(function(d, i) { return 100 * i})
        .attr('transform', function(d) { 
          return 'translate(' + xScale(d.date) + ',' + yScale(d.name) + ')';
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
          var parentEl = this.parentElement;
          d3.select(parentEl)
          .append('text')
          .attr('class', 'label')
          .text(function(d) { return d.name; })
          .attr('text-anchor', 'middle')
          .attr('transform', function(d, i) {
            return 'translate(' + 0 + ',' + (-rScale(d.count) - 5) + ')'
          })
          .classed('highlight winner', function(d) {
            if(d.date === d3.min(dateExtent)) {
              return true;
            }
          });
          d3.select(this)
          .classed('highlight winner', function(d) {
            if(d.date === d3.min(dateExtent)) {
              return true;
            }
          });
          drawFinishLine();
        }

        function drawFinishLine() {
            finishLine
              .style('opacity', 1);
        }

        function highlight() {
          var parentEl = this.parentElement;
          d3.select(this).select('circle.source')
          .classed('highlight', true);
          d3.select(this).select('text.label')
          .classed('highlight', true);
          parentEl.appendChild(this);
        }

        function unHighlight() {
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
          return d3.descending(a.count, b.count);
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
    scope: {
      chartData: '='
    },
    link: function(scope, elem, attrs) {
      var d3 = $window.d3;

      var dummyData = 
      [
        {
          "keyword": "sócrates",
          "totals": [
            {
              "time": "2014-12-05",
              "articles": 5,
              "total_type_articles": 3202,
              "percent_of_type": 0.16,
              "total_query_articles": 204,
              "percent_of_query": 2.45,
              "total_articles_of_type_by_day": 26,
              "percent_of_type_by_day": 19.23,
              "total_period_articles": 204,
              "twitter_shares": 16,
              "facebook_shares": 33,
              "total_shares": 49
            },
            {
              "time": "2014-12-06",
              "articles": 2,
              "total_type_articles": 3202,
              "percent_of_type": 0.06,
              "total_query_articles": 204,
              "percent_of_query": 0.98,
              "total_articles_of_type_by_day": 13,
              "percent_of_type_by_day": 15.38,
              "total_period_articles": 204,
              "twitter_shares": 2,
              "facebook_shares": 7,
              "total_shares": 9
            },
            {
              "time": "2014-12-07",
              "articles": 3,
              "total_type_articles": 3202,
              "percent_of_type": 0.09,
              "total_query_articles": 204,
              "percent_of_query": 1.47,
              "total_articles_of_type_by_day": 28,
              "percent_of_type_by_day": 10.71,
              "total_period_articles": 204,
              "twitter_shares": 4,
              "facebook_shares": 4,
              "total_shares": 8
            }
          ]
        },
        {
          "keyword": "mourinho",
          "totals": [
            {
              "time": "2014-12-06",
              "articles": 1,
              "total_source_articles": 6229,
              "percent_of_source": 0.02,
              "total_query_articles": 22,
              "percent_of_query": 4.55,
              "total_period_articles": 22,
              "twitter_shares": 7,
              "facebook_shares": 3,
              "total_shares": 10
            },
            {
              "time": "2014-12-09",
              "articles": 1,
              "total_source_articles": 6229,
              "percent_of_source": 0.02,
              "total_query_articles": 22,
              "percent_of_query": 4.55,
              "total_period_articles": 22,
              "twitter_shares": 6,
              "facebook_shares": 8,
              "total_shares": 14
            },
            {
              "time": "2014-12-10",
              "articles": 1,
              "total_source_articles": 6229,
              "percent_of_source": 0.02,
              "total_query_articles": 22,
              "percent_of_query": 4.55,
              "total_period_articles": 22,
              "twitter_shares": 7,
              "facebook_shares": 0,
              "total_shares": 7
            },
            {
              "time": "2014-12-15",
              "articles": 1,
              "total_source_articles": 6229,
              "percent_of_source": 0.02,
              "total_query_articles": 22,
              "percent_of_query": 4.55,
              "total_period_articles": 22,
              "twitter_shares": 5,
              "facebook_shares": 0,
              "total_shares": 5
            }
          ]
        }
      ];

      // Watcher

      // scope.$watch('chartData', function(newVal, oldVal) {
      //   var data = newVal;
      //   if(data.length) {
      //     scope.render(data);
      //   }
      // }, true);

      // Set parent SVG dimensions
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

      renderGraph(dummyData);

      function renderGraph(incomingData) {
        
        var dates = [];

        incomingData.map(function(obj) {
          obj.totals.map(function(arr) {
            dates.push(arr.time);
          });
        });

        incomingData.forEach(function(d) {
          d.keyword = d.keyword;
          console.log(d.totals);
        });

        console.log(incomingData);

        xScale
          .domain(dates);

        svg.select('.x.axis')
          .call(xAxis);


      }


    }


  }
});