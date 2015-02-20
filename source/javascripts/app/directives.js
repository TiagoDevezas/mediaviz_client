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
      // var margin = {top: 50, right: 50, bottom: 50, left: 100 };
      // var width = 960 - margin.left - margin.right;
      // var height = 500 - margin.top - margin.bottom;

      var d3 = $window.d3;

      var svg = d3.select('svg');

      var scopedData = $parse(attrs.chartData);

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