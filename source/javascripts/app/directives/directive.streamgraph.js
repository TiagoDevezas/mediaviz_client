mediavizDirectives.directive('streamGraph', function($timeout) {
	return {
		restrict: 'AE',
		scope: '=',
		link: function(scope, elem, attrs) {

			$timeout(function() {
				var width = angular.element(elem[0]).parent()[0].clientWidth;
				setupChart(width - 16);
			}, 10);

			var format = d3.time.format("%Y-%m-%d");

			var datearray = [];

			function setupChart(width) {

					var margin = {top: 20, right: 40, bottom: 30, left: 30};

					var width = width - margin.left - margin.right;
					var height = 600 - margin.top - margin.bottom;

					var svg = d3.select(elem[0]).append("svg")
					    .attr("width", width + margin.left + margin.right)
					    .attr("height", height + margin.top + margin.bottom)
					  .append("g")
					    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				  d3.csv("data/diversity_stream.csv", function(d) {
					  return {
					    date: format.parse(d['window'].split('..')[0]),
					    news: +d.newsExclusive,
					    blogs: +d.blogsExclusive,
					    common: +d.common
					  };
					}, function(error, data) {
						var newData = [];
						data.forEach(function(d) {
							newData.push({key: 'blogs', value: d.blogs, date: d.date});
							newData.push({key: 'common', value: d.common, date: d.date});
							newData.push({key: 'news', value: d.news, date: d.date});
						});
						createChart(newData, svg, width, height);
					});
			}

			function createChart(data, svg, width, height) {

				var tooltip = d3.select(elem[0])
				    .append("div")
				    .attr("class", "remove")
				    .style("position", "absolute")
				    .style("z-index", "20")
				    .style("visibility", "hidden")
				    .style("top", "30px")
				    .style("left", "55px");

				var x = d3.time.scale()
				    .range([0, width]);

				var y = d3.scale.linear()
				    .range([height-10, 0]);

				var xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom")
				    .tickFormat(format);
				    // .ticks(d3.time.days);

				var yAxis = d3.svg.axis()
				    .scale(y);

				var yAxisr = d3.svg.axis()
				    .scale(y);

				var stack = d3.layout.stack()
				    .offset("silhouette")
				    .values(function(d) { return d.values; })
				    .x(function(d) { return d.date; })
				    .y(function(d) { return d.value; });

				var nest = d3.nest()
				    .key(function(d) { return d.key; });

				var area = d3.svg.area()
				    .interpolate("cardinal")
				    .x(function(d) { return x(d.date); })
				    .y0(function(d) { return y(d.y0); })
				    .y1(function(d) { return y(d.y0 + d.y); });
				console.log(data);
				var layers = stack(nest.entries(data));

			  x.domain(d3.extent(data, function(d) { return d.date; }));
			  y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

			  svg.selectAll(".layer")
			      .data(layers)
			    .enter().append("path")
			      .attr("class", "layer")
			      .attr("d", function(d) { return area(d.values); })
			      .style("fill", function(d, i) {
			      	if(d.key == 'news') {
			      		return "#2ca02c"; 
			      	}
			      	if(d.key == 'blogs') {
			      		return "#ff7f0e"; 
			      	}
			      	if(d.key == 'common') {
			      		return "#9F8E1C"; 
			      	}
			      });


			  svg.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + height + ")")
			      .call(xAxis);

			  svg.append("g")
			      .attr("class", "y axis")
			      .attr("transform", "translate(" + width + ", 0)")
			      .call(yAxis.orient("right"));

			  svg.append("g")
			      .attr("class", "y axis")
			      .call(yAxis.orient("left"));

			      svg.selectAll(".layer")
			          .attr("opacity", 1)
			          .on("mouseover", function(d, i) {
			            svg.selectAll(".layer").transition()
			            .duration(250)
			            .attr("opacity", function(d, j) {
			              return j != i ? 0.6 : 1;
			          })})

			          .on("mousemove", function(d, i) {
			            mousex = d3.mouse(this);
			            mousex = mousex[0];
			            var invertedx = x.invert(mousex);
			            invertedx = format(invertedx);
			            var selected = (d.values);
			            for (var k = 0; k < selected.length; k++) {
			              datearray[k] = selected[k].date
			              datearray[k] = format(datearray[k]);
			            }

			            mousedate = datearray.indexOf(invertedx);
			            pro = d.values[mousedate].value;


			            d3.select(this)
			            .classed("hover", true)
			            // .attr("stroke", strokecolor)
			            // .attr("stroke-width", "0.5px"), 
			            tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "visible");
			            
			          })
			          .on("mouseout", function(d, i) {
			           svg.selectAll(".layer")
			            .transition()
			            .duration(250)
			            .attr("opacity", "1");
			            d3.select(this)
			            .classed("hover", false)
			            .attr("stroke-width", "0px"), tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "hidden");
			        })
			          
			        var vertical = d3.select(elem[0])
			              .append("div")
			              .attr("class", "remove")
			              .style("position", "absolute")
			              .style("z-index", "19")
			              .style("width", "1px")
			              .style("height", height)
			              .style("top", "30px")
			              .style("bottom", "40px")
			              .style("left", "0px")
			              .style("background", "#000");

			        d3.select(elem[0])
			            .on("mousemove", function(){  
			               mousex = d3.mouse(this);
			               mousex = mousex[0] + 5;
			               vertical.style("left", mousex + "px" )})
			            .on("mouseover", function(){  
			               mousex = d3.mouse(this);
			               mousex = mousex[0] + 5;
			               vertical.style("left", mousex + "px")});

			}


		}
	}
});