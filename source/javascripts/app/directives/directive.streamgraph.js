mediavizDirectives.directive('streamGraph', function($timeout, $rootScope) {
	return {
		restrict: 'AE',
		scope: '=',
		link: function(scope, elem, attrs) {

			$rootScope.loading = true;

			$timeout(function() {
				var width = document.getElementById('diversity').offsetWidth - 16;
				setupChart(width - 40);
				scope.streamReady = true;
				// scope.$apply();
			}, 1);

			var format = d3.time.format("%Y-%m-%d");

			var datearray = [];

			function setupChart(width) {

					var margin = {top: 20, right: 80, bottom: 120, left: 80};

					var width = width - margin.left - margin.right;
					var height = 500 - margin.top - margin.bottom;

					var margin2 = {top: 430, right: margin.right, bottom: 20, left: margin.left};
					var height2 = 500 - margin2.top - margin2.bottom;

					var svg = d3.select(elem[0]).append("svg")
					    .attr("width", width + margin.left + margin.right)
					    .attr("height", height + margin.top + margin.bottom)
					    .style({
					    	"font-size": "12px",
					    	"font-family": "RobotoDraft, Roboto, 'Helvetica Neue', sans-serif"
					    });

					svg.append("defs").append("clipPath")
					    .attr("id", "clip")
					  .append("rect")
					    .attr("width", width)
					    .attr("height", height);

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
						createChart(newData, svg, width, height, height2, margin, margin2);
					});
			}

			function createChart(data, svg, width, height, height2, margin, margin2) {

				$rootScope.loading = false;

				var focus = svg.append("g")
						.attr("class", "focus")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				var context = svg.append("g")
				    .attr("class", "context")
				    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

				var tooltip = d3.select(elem[0])
				    .append("div")
				    .attr("class", "remove")
				    .style("position", "absolute")
				    .style("z-index", "20")
				    .style("visibility", "hidden")
				    .style("top", "30px")
				    .style("left", "105px");

				var x = d3.time.scale()
				    .range([0, width]);

				var x2 = d3.time.scale()
				    .range([0, width]);

				var y = d3.scale.linear()
				    .range([height-10, 0]);

				var y2 = d3.scale.linear()
						.range([height2-10, 0]);

				var xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom")
				    .tickFormat(format);
				    // .ticks(d3.time.days);

				var xAxis2 = d3.svg.axis()
						.scale(x2)
						.orient("bottom")
						.tickFormat(format);

				var yAxis = d3.svg.axis()
				    .scale(y);

				var yAxisr = d3.svg.axis()
				    .scale(y);

				var brush = d3.svg.brush()
				    .x(x2)
				    // .extent([moment("2015-09-01"), moment("2015-09-30")])
				    .on("brush", brushed);

				scope.$on('changeStreamRange', function(evt, range) {
				  brush.extent([format.parse(range[0]), format.parse(range[1])]);
				 	svg.select(".brush").call(brush);
				 	brushed();
				});

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

				var area2 = d3.svg.area()
				    .interpolate("cardinal")
				    .x(function(d) { return x2(d.date); })
				    .y0(function(d) { return y2(d.y0); })
				    .y1(function(d) { return y2(d.y0 + d.y); });
				
				var layers = stack(nest.entries(data));

			  x.domain(d3.extent(data, function(d) { return d.date; }));
			  y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

			  x2.domain(x.domain());
			  y2.domain(y.domain());

			  focus.selectAll(".layer")
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

			  context.selectAll(".layer_context")
			      .data(layers)
			    .enter().append("path")
			      .attr("class", "layer_context")
			      .attr("d", function(d) { return area2(d.values); })
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


			  focus.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + height + ")")
			      .call(xAxis);

			  focus.append("g")
			      .attr("class", "y axis")
			      .attr("transform", "translate(" + width + ", 0)")
			      .call(yAxis.orient("right"));

			  focus.append("g")
			      .attr("class", "y axis")
			      .call(yAxis.orient("left"));

			  context.append("g")
			        .attr("class", "x axis")
			        .attr("transform", "translate(0," + height2 + ")")
			        .call(xAxis2);

			    context.append("g")
			        .attr("class", "x brush")
			        .call(brush)
			      .selectAll("rect")
			        .attr("y", -6)
			        .attr("height", height2 + 7);

				function brushed() {
					formatedRanged = [moment(brush.extent()[0]).format("YYYY-MM-DD"), moment(brush.extent()[1]).format("YYYY-MM-DD")];
				  x.domain(brush.empty() ? x2.domain() : brush.extent());
				  focus.selectAll(".layer")
				  	.attr("d", function(d) { return area(d.values); })
				  	.style("clip-path", "url(#clip)")
				  focus.select(".x.axis").call(xAxis);
				  scope.$broadcast('changeZoomRange', formatedRanged);
				}

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
			              .style("bottom", "100px")
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

				brush.extent([moment("2015-09-01"), moment("2015-09-30")]);
				svg.select(".brush").call(brush);

			}


		}
	}
});