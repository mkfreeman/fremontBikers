var Bar = function(sets) {
	var self = this
	console.log('bar settings ', sets)
	self.settings = sets
	self.cf = self.settings.cf
	self.init()
}

Bar.prototype.init = function() {
	var self = this
	self.prepData()
	self.build()
}

Bar.prototype.prepData = function() {
	var self = this
	
	// Prep raw data

	self.cf.dim = self.cf.data.dimension(function(d) { return d.date;})
	self.cf.values = self.cf.dim.group(d3.time.day).reduceSum(function(d) {return d.value})
	
	// Get min/max
	var xValues = self.cf.values.all().map(function(d) {return d.key})
	var yValues = self.cf.values.all().map(function(d) {return d.value})
	self.settings.xmin = d3.min(xValues)
	self.settings.xmax = d3.max(xValues)
	self.settings.ymax = d3.max(yValues)	
}


Bar.prototype.build = function() {
	var self = this
	var charts = [
	barChart()
			.dimension(self.cf.dim)
			.group(self.cf.values)
			.round(d3.time.day.round)
			.y(d3.scale.linear().range([0, settings.height]).domain([0,self.settings.ymax]))
		  .x(d3.time.scale()
			.domain([self.settings.xmin,self.settings.xmax])
			.rangeRound([0, 1100]))
	]
	var chart = d3.selectAll(".chart")
		  .data(charts)
		  .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });


	  renderAll();

	  // Renders the specified chart or list.
	  function render(method) {
		d3.select(this).call(method);
	  }

	  // Whenever the brush moves, re-rendering everything.
	  function renderAll() {
		chart.each(render);
		d3.select("#active").text(settings.formatters.number(self.cf.all.reduceSum(function(d) {return d.value}).value()));
	
	  d3.select("#numbikers").text(settings.formatters.number(self.cf.all.reduceSum(function(d) {return d.value}).value()));

		var total = Number(d3.select('#total').text().replace(/,/g, ''))
		 d3.selectAll("#percent")
		  .text(settings.formatters.percent(self.cf.all.reduceSum(function(d) {return d.value}).value()/total));

  
	  }



	  window.filter = function(filters) {
		filters.forEach(function(d, i) { charts[i].filter(d); });
		renderAll();
	  };

	  window.reset = function(i) {
		charts[i].filter(null);
		renderAll();
	  };
}


function barChart() {
		if (!barChart.id) barChart.id = 0;

		var margin = {top: 10, right: 10, bottom: 20, left: 10},
			x,
			y,
			// y = d3.scale.linear().range([300, 0]),
			id = barChart.id++,
			axis = d3.svg.axis().orient("bottom"),
			brush = d3.svg.brush(),
			brushDirty,
			dimension,
			group,
			round;

		function chart(div) {
		  var width = x.range()[1]
	//           height = y.range()[0];

		  // y.domain([maxHourBikers,0 ]);
		  div.each(function() {
			var div = d3.select(this),
				g = div.select("g");

			// Create the skeletal chart.
			if (g.empty()) {
			  div.select(".title").append("a")
				  .attr("href", "javascript:reset(" + id + ")")
				  .attr("class", "reset")
				  .text("reset")
				  .style("display", "none");

			  g = div.append("svg")
				  .attr("width", width + margin.left + margin.right)
				  .attr("height", settings.height + margin.top + margin.bottom)
				  .attr('id', id)
				.append("g")
				  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				  g.selectAll('.bar').data(group.all())
						.enter().append('rect')
						.attr('x', function(d) {return x(d.key)})
						.attr('y', function(d) {return settings.height - y(d.value)})
						.attr('width', 1)
						.attr('height', function(d) {return y(d.value)})
						.attr('class', 'bar')


			  g.append("g")
				  .attr("class", "axis")
				  .attr("transform", "translate(0," + settings.height + ")")
				  .call(axis);

			  // Initialize the brush component with pretty resize handles.
			  var gBrush = g.append("g").attr("class", "brush").call(brush);
			  gBrush.selectAll("rect").attr("height", settings.height);
			}

			// Only redraw the brush if set externally.
			if (brushDirty) {
			  brushDirty = false;
			  g.selectAll(".brush").call(brush);
			  div.select(".title a").style("display", brush.empty() ? "none" : null);
			  if (brush.empty()) {
				g.selectAll("#clip-" + id + " rect")
					.attr("x", 0)
					.attr("width", width);
			  } else {
				var extent = brush.extent();
				g.selectAll("#clip-" + id + " rect")
					.attr("x", x(extent[0]))
					.attr("width", x(extent[1]) - x(extent[0]));
			  }
			}
			g.selectAll(".bar").attr('x', function(d) {return x(d.key)})
						.attr('y', function(d) {return settings.height - y(d.value)})
						.attr('width', 1)
						.attr('height', function(d) {return y(d.value)})
		  });

		}

		brush.on("brushstart.chart", function() {
		  var div = d3.select(this.parentNode.parentNode.parentNode);
		  div.select(".title a").style("display", null);
		});

		brush.on("brush.chart", function() {
			console.log('id ', this.parentNode.parentNode.id)
			 var total = Number(d3.select('#total').text().replace(/,/g, ''))
		 d3.selectAll("#percentage")
		  .text(' (' + settings.formatters.percent(self.cf.all.reduceSum(function(d) {return d.value}).value()/total) + ' of total)');

		  var g = d3.select(this.parentNode),
			  extent = brush.extent();
			  console.log(extent)
			  if(this.parentNode.parentNode.id == 0) {
				d3.select('#startdate').text(settings.formatters.titleDate(extent[0]))
				d3.select('#enddate').text(settings.formatters.titleDate(extent[1]))
			  }
			  else if(this.parentNode.parentNode.id == 1) {
		  
				d3.select('#starttime').text('(' + settings.formatters.titleTime(extent[0]) + '-')
				d3.select('#endtime').text(settings.formatters.titleTime(extent[1]) + ')')
			  }
		  if (round) g.select(".brush")
			  .call(brush.extent(extent = extent.map(round)))
			.selectAll(".resize")
			  .style("display", null);
		  g.select("#clip-" + id + " rect")
			  .attr("x", x(extent[0]))
			  .attr("width", x(extent[1]) - x(extent[0]));
		  dimension.filterRange(extent);
		});

		brush.on("brushend.chart", function() {
		  if (brush.empty()) {
			var div = d3.select(this.parentNode.parentNode.parentNode);
			div.select(".title a").style("display", "none");
			div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
			dimension.filterAll();
			d3.selectAll("#percentage").text('')
			d3.select('#startdate').text(settings.formatters.titleDate(minDate))
			d3.select('#enddate').text(settings.formatters.titleDate(maxDate))
			d3.select('#starttime').text('')
			d3.select('#endtime').text('')
		  }
		});

		chart.margin = function(_) {
		  if (!arguments.length) return margin;
		  margin = _;
		  return chart;
		};

		chart.x = function(_) {
		  if (!arguments.length) return x;
		  x = _;
		  axis.scale(x);
		  brush.x(x);
		  return chart;
		};

		chart.y = function(a) {
		  if (!arguments.length) return y;
		  y = a;
		  return chart;
		};

		chart.dimension = function(_) {
		  if (!arguments.length) return dimension;
		  dimension = _;
		  return chart;
		};

		chart.filter = function(_) {

		  if (_) {
			brush.extent(_);
			dimension.filterRange(_);
		  } else {
			brush.clear();
			dimension.filterAll();
		  }
		  brushDirty = true;
		  return chart;
		};

		chart.group = function(_) {
		  if (!arguments.length) return group;
		  group = _;
		  return chart;
		};

		chart.round = function(_) {
		  if (!arguments.length) return round;
		  round = _;
		  return chart;
		};

		return d3.rebind(chart, brush, "on");
	  }
	// });
// }