mediavizDirectives.directive('worldMap', function($timeout) {
  return {
    restrict: 'AE',
    scope: {
      data: '='
    },
    link: function(scope, elem, attrs) {

      d3.select(window).on('resize', resize);

      // Data watcher

      scope.$watch('data', function(incomingData) {
        // var incomingData = angular.fromJson(incomingData);
        if(incomingData) {
          updateMap(incomingData);
        }
      }, true);

      scope.$on("resizeMap", function() {
        resize();
      });

      function resize() {
        $timeout(function() {

          var scalingFactor = 4/2.2;

          width = parseInt(d3.select(elem[0]).style("width"));
          height = width / scalingFactor;

          console.log('resize called', width, height);

          d3.selectAll('svg.world-map')
            .attr('width', width)
            .attr('height', height);

          projection
            .translate([width /2, height / 1.6])
            .scale(width / 2 / Math.PI);

          d3.selectAll('svg.world-map').selectAll('.country')
            .attr('d', path);

          d3.selectAll('.legend-container')
            .attr('transform', 'translate(' + 20 + ',' + (height - (colorbrewerRamp.length * 20) - 20) + ')');

        }, 0);
      }

      // Set up the map
      var scalingFactor = 4/2.2;

      var width = parseInt(d3.select(elem[0]).style("width")),
        height = width / scalingFactor;

      var tooltip = d3.select(elem[0]).append("div").attr("class", "map-tooltip tooltip hidden");


      var svg = d3.select(elem[0]).append('svg')
        .attr('class', 'world-map')
        .attr('width', width)
        .attr('height', height);
        // .style('background-color', '#9CB8CC')
        // .style('border', '1px solid #bbb')

      var boundingBox;

      var colorbrewerRamp = colorbrewer.GnBu[7];
      // colorbrewerRamp.shift();

      var color = d3.scale.log()
        .range(['#ffffbf', '#2b83ba']);
        // .range(colorbrewerRamp);

      var zoom = d3.behavior.zoom()
            .scaleExtent([1, 8])
            .on("zoom", move);

      var projection = d3.geo.mercator()
          .translate([width /2, height / 1.6])
          .scale(width / 2 / Math.PI);

      var path = d3.geo.path()
          .projection(projection);

      // var legendContainer = svg.append('g')
      //   .attr('class', 'legend-container')
      //   .classed('hidden', true)
      //   .attr('transform', 'translate(' + 20 + ',' + (height - (colorbrewerRamp.length * 20) - 20) + ')');

      // var legend = legendContainer.selectAll('g.legend')
      //   .data(angular.copy(colorbrewerRamp).reverse())
      //   .enter().append('g')
      //   .attr('class', 'legend');

      // var ls_w = 20, ls_h = 20;

      // legend
      //   .append("rect")
      //   // .attr("x", 20)
      //   .attr("y", function(d, i){ return (i*ls_h); })
      //   .attr("width", ls_w)
      //   .attr("height", ls_h);

      // legend
      //   .append('text')
      //   .attr("transform", function(d, i) {  return "translate(" + 25 + "," + (i*20 + 14) + ")" });

      function move() {

        var t = d3.event.translate;
        var s = d3.event.scale;
        zscale = s;
        var h = height/4;


        t[0] = Math.min(
          (width/height)  * (s - 1),
          Math.max( width * (1 - s), t[0] )
        );

        t[1] = Math.min(
          h * (s - 1) + h * s,
          Math.max(height  * (1 - s) - h * s, t[1])
        );

        zoom.translate(t);
        boundingBox.attr("transform", "translate(" + t + ")scale(" + s + ")");

      }

        d3.json('data/world.json', function(world) {
          var paises = topojson.feature(world, world.objects.world);

          var projection = d3.geo.mercator()
          .translate([width /2, height / 1.6])
          .scale(width / 2 / Math.PI);

          var path = d3.geo.path()
          .projection(projection);

          boundingBox = svg
            .call(zoom)
            .append('g')
            .attr('class', 'mundo');

          var countries = boundingBox.selectAll('g')
            .data(paises.features, function (d) { return d.properties.name})
            .enter()
            .append('g')
            .attr('class', function (d) { return d.properties.name})
            .append('path')
            .attr('d', path)
            .attr('class', 'country')
            .style('fill', 'lightgray')
            .style('stroke', '#111')
            .style('stroke-width', '0.25px');
        });


      // Update function
      function updateMap(data) {
        var maxCount = d3.max(data, function(d) { return d.count });

        var color_domain = [1, maxCount];

        color.domain(color_domain);

        var countByAlpha3 = {};
        var nameByAlpha3 = {};

        data.forEach(function(d) {
          countByAlpha3[d.alpha3] = +d.count;
          nameByAlpha3[d.alpha3] = d.name;
        });

        var countries = svg.selectAll('.country');

        countries
          .transition()
          .duration(500)
          .style('fill', function(d) {
            return countByAlpha3[d.id] ? color(countByAlpha3[d.id]) : '#eee'
          });

        // legendContainer
        //   .classed('hidden', false);

        // legend.selectAll('rect')
        //   .style("fill", function(d, i) { return d; })
        //   .style("opacity", 0.8);

        // legend.selectAll('text')
        //   .text(function(d, i) {
        //     return "" + color.invertExtent(d)[0] + "-" + color.invertExtent(d)[1]
        //   });

        // console.log(color.invertExtent('#f0f9e8'));

        //offsets for tooltips
      var offsetL = elem[0].offsetLeft+20;
      var offsetT = elem[0].offsetTop+10;


      countries
      .on("mousemove", function(d,i) {
        var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

        tooltip.classed("hidden", false)
         .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
         .html(
          nameByAlpha3[d.id] ? nameByAlpha3[d.id] + ": " + countByAlpha3[d.id] + " artigos" : "Sem dados"
          )
      })
      .on("mouseout", function(d,i) {
        tooltip.classed("hidden", true);
      });

      }
    }
  }
});