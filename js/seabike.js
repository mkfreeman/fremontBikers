// Seabike function-object
var Seabike = function(sets) {
	var self = this
	self.settings = sets
	self.init()
}

Seabike.prototype.init = function() {
	var self = this
	d3.csv("data/bridge_data.csv", function(error, rawData) {
		self.rawData = rawData
		self.prepData()
		// self.buildNew()
		self.buildOld()
	})
}

Seabike.prototype.prepData = function() {
	var self = this
	// Prep raw data
	self.data = []
	var index = 0
	self.rawData.forEach(function(d, i) {
		self.data.push({index:index,date:new Date(d.Date), direction:'north', value:Number(d['Fremont Bridge NB'])})
		index += 1
		self.data.push({index:index, date:new Date(d.Date), direction:'south', value:Number(d['Fremont Bridge SB'])})
	  });
	
	// Crossfilter object
	self.cf = {}
	self.cf.data = crossfilter(self.data) 
	self.cf.all = self.cf.data.groupAll()
	
}

Seabike.prototype.buildNew = function() {
	var self = this
	var sets = {}
	sets.cf = self.cf
	self.charts = []
	self.charts[0] = new Bar(sets)
	self.charts[1] = new Bar(sets)
	self.charts.map(function(chart) { chart.on("brush", self.updateCharts).on("brushend", self.updateCharts); });
}

Seabike.prototype.updateCharts = function () {
	var self = this
	self.charts.map(function(chart){
		if(typeof(chart.update == 'function')) {
			chart.update()
		}
	})

}

Seabike.prototype.renderAll = function() {
	var self = this
}



Seabike.prototype.buildOld = function() {
	var self = this
	console.log('building with data ', self.data)
	var rawData = self.data
	// d3.csv("data/bridge_data.csv", function(error, rawData) {
		
// 	var cfObjs = {}
// 	var fils = 'date'
// 	cfObjs[fils] = cfObjs.dimension(function(d) { return d[fils]; })
// 	cfObjs['values'] = cfObjs[fils]
  
	data = []
	var index = 0
	rawData.forEach(function(d, i) {
		data.push({index:index,date:new Date(d.Date), direction:'north', value:Number(d['Fremont Bridge NB'])})
		index += 1
		data.push({index:index, date:new Date(d.Date), direction:'south', value:Number(d['Fremont Bridge SB'])})
	  });


	  // Create the crossfilter for the relevant dimensions and groups.
		  var cfData = crossfilter(data),
			  all = cfData.groupAll(),
			  date = cfData.dimension(function(d) { return d.date; }),
			  dates = date.group(d3.time.day),
			  dateBikers = date.group(d3.time.day).reduceSum(function(d) {return d.value})
	  
		  hour = cfData.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
		  hours = hour.group(Math.floor).reduceSum(function(d) {return d.value})
		  hourBikers =hour.group(Math.floor).reduceSum(function(d) {return d.value})

	var minDate =  d3.min(dates.all().map(function(d) {return d.key})) 
		var maxDate =  d3.max(dates.all().map(function(d) {return d.key})) 

	d3.select('#startdate').text(settings.formatters.titleDate(minDate))
	d3.select('#enddate').text(settings.formatters.titleDate(maxDate))
		var maxDayBikers = d3.max(dateBikers.all().map(function(d) {return d.value})) 
		var maxHourBikers = d3.max(hourBikers.all().map(function(d) {return d.value}))
	  var charts = [
	
	

		barChart()
			.dimension(date)
			.group(dateBikers)
			.round(d3.time.day.round)
			.y(d3.scale.linear().range([0, settings.height]).domain([0,maxDayBikers]))
		  .x(d3.time.scale()
			.domain([minDate,maxDate])
			.rangeRound([0, 1100])),
		   // .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)]),
		
	 barChart()
			.dimension(hour)
			.group(hours)
			.y(d3.scale.linear().range([0, settings.height]).domain([0,maxHourBikers]))

		  .x(d3.scale.linear()
			.domain([0, 24])
			.rangeRound([0, 10 * 24])),   

	  ];

	  // Given our array of charts, which we assume are in the same order as the
	  // .chart elements in the DOM, bind the charts to the DOM and render them.
	  // We also listen to the chart's brush events to update the display.
	  var chart = d3.selectAll(".chart")
		  .data(charts)
		  .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

  
	  // Render the total.
	  d3.selectAll("#total")
		  .text(settings.formatters.number(cfData.groupAll().reduceSum(function(d) {return d.value}).value()));
	
	 d3.selectAll("#numbikers")
		  .text(settings.formatters.number(cfData.groupAll().reduceSum(function(d) {return d.value}).value()));

	  d3.selectAll("#percent")
		  .text(settings.formatters.percent(all.reduceSum(function(d) {return d.value}).value()/cfData.groupAll().reduceSum(function(d) {return d.value}).value()));

	  renderAll();

	  // Renders the specified chart or list.
	  function render(method) {
	  	// console.log('render method ', method)
		d3.select(this).call(method);
	  }

	  // Whenever the brush moves, re-rendering everything.
	  function renderAll() {
		chart.each(render);
		console.log('renderall ', all)
		d3.select("#active").text(settings.formatters.number(all.reduceSum(function(d) {return d.value}).value()));
	
	  d3.select("#numbikers").text(settings.formatters.number(all.reduceSum(function(d) {return d.value}).value()));

		var total = Number(d3.select('#total').text().replace(/,/g, ''))
		 d3.selectAll("#percent")
		  .text(settings.formatters.percent(all.reduceSum(function(d) {return d.value}).value()/total));

  
	  }



	  window.filter = function(filters) {
		filters.forEach(function(d, i) { charts[i].filter(d); });
		renderAll();
	  };

	  window.reset = function(i) {
		charts[i].filter(null);
		renderAll();
	  };

  

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
		  .text(' (' + settings.formatters.percent(all.reduceSum(function(d) {return d.value}).value()/total) + ' of total)');

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
}

var test = new Seabike()
// console.log(test.data)
// var tmp = {}
// tmp.rawData = test.data
// var test2 = new Bar(tmp)
