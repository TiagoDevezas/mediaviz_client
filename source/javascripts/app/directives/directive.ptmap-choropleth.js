mediavizDirectives.directive('ptMap', function($timeout) {
  return {
      restrict: 'AE',
      scope: {
        data: '='
      },
      link: function(scope, elem, attrs) {

        angular.element(elem).attr('class', 'chart-container');

        // d3.select(window).on('resize', resize);

        // Data watcher
        scope.$watch('data', function(incomingData) {
          if(incomingData) {
            updateMap(incomingData);
          }
        }, true);

        // scope.$on("resizeMap", function() {
        //   resize();
        // });

        // function resize() {
        //   width = parseInt(d3.select(elem[0]).style("width"));
        //   height = parseInt(d3.select(elem[0]).style("height"));

        //   svg
        //     .attr('width', width)
        //     .attr('height', height);

        //   projection
        //     .translate([width /2, height / 1.6])
        //     .scale(width / 2 / Math.PI);

        //     d3.selectAll('.distrito')
        //       .attr('d', path);
        // }

        var width = 600,
          height = 500;

        var tooltip = d3.select(elem[0]).append("div").attr("class", "map-tooltip tooltip hidden");


        var svg = d3.select(elem[0]).append('svg')
          .attr('width', width)
          .attr('height', height);

        var legend = svg.append('g')
          .attr('class', 'legend-container')
          .classed('hidden', true);

        var colorbrewerRamp = colorbrewer.GnBu[7];
        // colorbrewerRamp.shift();

        var color = d3.scale.pow().exponent(.5)
          .range(['#ffffbf', '#2b83ba']);

        d3.json('data/pt.json', function(pt) {
          // console.log(pt.objects.portugal);
          var allDistricts = pt.objects.portugal;

          var continentalDistricts = allDistricts.geometries.filter(function(d) {
            return d.id !== "PO23" && d.id !== "PO10";
          });

          var madeiraDistrict = allDistricts.geometries.filter(function(d) {
            return d.id == "PO10";
          });

          var acoresDistrict = allDistricts.geometries.filter(function(d) {
            return d.id == "PO23";
          });

          allDistricts.geometries = continentalDistricts;

          var portugal = topojson.feature(pt, allDistricts);

          var projection = d3.geo.mercator()
          // .center(center)
          .scale(1);

          var path = d3.geo.path()
          .projection(projection);


          var cWidth = width / 2,
          cHeight = height;


          var b = path.bounds(portugal);
          var s = 0.95 / Math.max(
            (b[1][0] - b[0][0]) / cWidth,
            (b[1][1] - b[0][1]) / cHeight
            );
          b = d3.geo.bounds(portugal);
          var center = [(b[1][0]+b[0][0])/2, (b[1][1]+b[0][1])/2];

          projection.scale(s);
          projection.center(center);
          projection.translate([cWidth / 2, cHeight / 2]);

          var bb = svg
          .append('g')
          .attr('class', 'continente')
          .attr('width', cWidth)
          .attr('height', cHeight)
          .attr('transform', 'translate(' + cWidth + ',' + 0 + ')');

          var portugal = bb.selectAll('g')
          .data(portugal.features, function (d) { return d.properties.name})
          .enter()
          .append('g')
          .attr('class', function (d) { return d.properties.name})
          .append('path')
          .attr('class', 'distrito')
          .attr('d', path);

          // Madeira map

          allDistricts.geometries = madeiraDistrict;

          var madeira = topojson.feature(pt, allDistricts);

          var mWidth = width / 2,
          mHeight = (height / 2) - 10;

          var projection = d3.geo.mercator()
          .center([-17.00479,32.74598])
          .scale(7000)
          .translate([mWidth / 2, mHeight / 2]);

          var path = d3.geo.path()
          .projection(projection);

          var madeira_box = svg.append('g')
          .attr('width', mWidth)
          .attr('height', mHeight)
          .attr('class', 'madeira-bb')
          .attr('transform', 'translate(' + 0 + ',' + (mHeight + 10) + ')');

          var madeira_bg = madeira_box.append('rect')
          .attr('class', 'madeira-bg')
          // .style('stroke', '#111')
          .style('fill', 'none')
          // .style('stroke-width', '0.25px')
          .attr('width', mWidth)
          .attr('height', mHeight);

          var madeiraPath = madeira_box.selectAll('g')
          .data(madeira.features)
          .enter()
          .append('g')
          .attr('class', function (d) { return d.properties.name})
          .append('path')
          .attr('class', 'distrito')
          .attr('d', path)
          .style('stroke', '#d3d3d3');

           // Azores map

           allDistricts.geometries = acoresDistrict;

           var acores = topojson.feature(pt, allDistricts);

           var aWidth = width / 2,
           aHeight = (height / 2) - 10;

           var projection = d3.geo.mercator()
           .center([-25.455322, 37.768254])
           .scale(3000)
           .translate([aWidth / 2 + 50, aHeight / 2]);

           var path = d3.geo.path()
           .projection(projection);

           var acores_box = svg.append('g')
           .attr('width', aWidth)
           .attr('height', aHeight)
           .attr('class', 'acores-bb')
           .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

           var acores_bg = acores_box.append('rect')
           .attr('class', 'acores-bg')
           .style('fill', 'none')
          //  .style('stroke', '#111')
          //  .style('stroke-width', '0.25px')
           .attr('width', aWidth)
           .attr('height', aHeight);

           var acoresPath = acores_box.selectAll('g')
           .data(acores.features)
           .enter()
           .append('g')
           .attr('class', function (d) { return d.properties.name})
           .append('path')
           .attr('d', path)
           .attr('class', 'distrito')
           .style('stroke', '#d3d3d3');

           svg.selectAll('.distrito')
            .style('fill', 'lightgray')
            .style('stroke', '#111')
            .style('stroke-width', '0.25px');

        });

        function updateMap(data) {

          var maxCount = d3.max(data, function(d) { return d.count });
          var minCount = d3.min(data, function(d) { return d.count });

          var color_domain = [maxCount];
          var legend_domain = [maxCount];

          var legendIntervals = [2, 5, 10];

          legendIntervals.forEach(function(el) {
            if((maxCount / el) > 1) {
              legend_domain.unshift(maxCount/el);
            }
          });

          if(minCount === 0) {
            color_domain.unshift(minCount + 1);
            legend_domain.unshift(minCount + 1);
          } else {
            color_domain.unshift(minCount);
            legend_domain.unshift(minCount);
          }

          color.domain(color_domain);
          var legendColor = color.copy();

          var countByFIPS = {};
          var nameByFIPS = {};

          data.forEach(function(d) {
            countByFIPS[d.fips] = +d.count;
            nameByFIPS[d.fips] = d.name;
          });

          var distritos = svg.selectAll('.distrito');

          distritos
            .transition()
              .duration(500)
              .style('fill', function(d) {
                return countByFIPS[d.id] ? color(countByFIPS[d.id]) : '#eee'
              });

          legend.attr('transform', 'translate(' + 20 + ',' + (height - (legend_domain.length * 20) - 20) + ')');

          var legendBox = legend.selectAll('g.legend')
              .data(legend_domain.reverse().map(function(d) {
                return Math.round(d);
              }), function(d, i) { return d; });

          // legend.exit().remove();
              
          legendBox.enter().append('g')
            .attr('class', 'legend');

          var legendRects = legend.selectAll("rect")
            .data(legend_domain.map(function(d) {
              return Math.round(d);
            }), function(d, i) { return d; });

          legendRects.enter()
            .append("rect");

          var ls_w = 20, ls_h = 20;

          legendRects
            // .attr("x", 20)
            .attr("y", function(d, i){ return (i*ls_h); })
            .attr("width", ls_w - 5)
            .attr("height", ls_h - 5)
            .style("stroke", "#000")
            .style("stroke-width", "1px")
            .style("fill", function(d, i) { return legendColor(d); })
            .style("opacity", 0.8);

          legendRects.exit()
            .remove();

          var legendText = legend.selectAll("text")
            .data(legend_domain.map(function(d) {
              return Math.round(d);
            }), function(d, i) { return d; });

          legendText.enter()
            .append("text");

          legendText
            .attr("transform", function(d, i) {  return "translate(" + 25 + "," + (i*20 + 14) + ")" })
            .text(function(d, i) {
              return d;
            });

          legendText.exit()
            .remove();

          legend
            .classed('hidden', function() {
              if(maxCount > 0) {
                return false;
              } else {
                return true;
              }
            });

            //offsets for tooltips
          var offsetL = elem[0].offsetLeft+20;
          var offsetT = elem[0].offsetTop+10;


          distritos
          .on("mousemove", function(d,i) {
            var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

            tooltip.classed("hidden", false)
             .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
             .html(
              nameByFIPS[d.id] ? nameByFIPS[d.id] + ": " + countByFIPS[d.id] + " artigos<br><span style='font-size: 12px;'>Clique para ver artigos</span" : "Sem dados"
              )
          })
          .on("mouseout", function(d,i) {
            tooltip.classed("hidden", true);
          })
          .on("click", function(d) {
            var countryName = d.properties.name;
            scope.$emit('countryClickEvent', { country: countryName, mapId: elem[0].getAttribute('id') });
          });

        }

      }
    }
});