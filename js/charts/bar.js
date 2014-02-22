var Bar = function(sets) {
	var self = this
	self.settings = sets
	self.data = self.settings.data
	self.init()
}

Bar.prototype.init = function() {
	var self = this
	self.prepData()
	self.setBrush()
	self.build()
}

Bar.prototype.prepData = function() {
	var self = this	
	// Get min/max
	var xValues = self.data.all().map(function(d) {return d.key})
	var yValues = self.data.all().map(function(d) {return d.value})
	self.settings.xmin = typeof(self.settings.padding.left) == 'number'? d3.min(xValues) - self.settings.padding.left: d3.min(xValues)
	self.settings.xmax = typeof(self.settings.padding.right) == 'number'? d3.max(xValues) + self.settings.padding.right: d3.max(xValues)
	self.settings.limits = [self.settings.xmin, self.settings.xmax]
	self.settings.ymin = d3.min(yValues)
	self.settings.ymax = d3.max(yValues)
	self.settings.y.range([0, self.settings.height]).domain([self.settings.ymax, 0])
	self.settings.x.range([0, self.settings.width]).domain([self.settings.xmin,self.settings.xmax])
		
}


Bar.prototype.build = function() {
	var self = this
	self.div = d3.select('#' + self.settings.container).append('div').attr('id', self.settings.id + '-div').attr('class', 'chart')
	self.titleDiv = self.div.append('div').attr('id', self.settings.id + '-title-div').attr('class', 'title-div').text(self.settings.title)
	self.rangeDiv = self.div.append('div').attr('id', self.settings.id + '-range-div').attr('class', 'range-div')
	self.rangeDiv.append('span').text(self.settings.titleFormatter([self.settings.xmin,self.settings.xmax]))
	self.rangeDiv.append('span')
				.attr('class', 'reset')
				.text('reset')
				.on('click', function(){
					self.settings.dimension.filter(null)
					self.brush.clear()
					self.brushG.call(self.brush)
					self.rangeDiv.selectAll('.reset').style('opacity', '.3').style('cursor', 'auto')
					self.settings.limits = [self.settings.xmin, self.settings.xmax]
					d3.select('#' + self.settings.id + '-range-div span').text(self.settings.titleFormatter(self.settings.limits))
					self.settings.updateAll()
				})
				.style('opacity', '.3').style('cursor', 'auto')
				
	self.svg = self.div.append("svg")
				  .attr("width", self.settings.width + self.settings.margin.left + self.settings.margin.right)
				  .attr("height", self.settings.height + self.settings.margin.top + self.settings.margin.bottom)
				  .attr('id', self.settings.id + '-svg')
	
	self.g = self.svg.append("g")
				  .attr("transform", "translate(" + self.settings.margin.left + "," + self.settings.margin.top + ")");

	self.g.selectAll('.bar').data(self.data.all())
				.enter().append('rect')
				.attr('x', function(d) {return self.settings.x(d.key)})
				.attr('height', function(d) {return self.settings.height - self.settings.y(d.value)})
				.attr('width', 1)
				.attr('y', function(d) {return self.settings.y(d.value)})
				.attr('class', 'bar')

	self.xAxisScale = d3.svg.axis().orient("bottom")
						.scale(self.settings.x)
						.tickFormat(self.settings.format.x)
						.ticks(self.settings.ticks.x)
 	self.xAxis = self.g.append("g")
				  .attr("class", "axis")
				  .attr("transform", "translate(0," + self.settings.height + ")")
				  .call(self.xAxisScale);

	self.yAxisScale = d3.svg.axis().orient("left")
						.scale(self.settings.y)
						.tickFormat(self.settings.format.y)
 	self.yAxis = self.g.append("g")
				  .attr("class", "axis")
				  .attr("transform", "translate(0," + 0 + ")")
				  .call(self.yAxisScale);
				  
	self.brushG = self.svg.append('g')	  
					.attr("transform", "translate(" + self.settings.margin.left + "," + self.settings.margin.top + ")")
					.attr('class', 'brush')
					.call(self.brush)
	self.brushG.selectAll('rect').attr('height', self.settings.height)
	if(typeof(self.settings.poshy) == 'function') self.settings.poshy(self)
}

Bar.prototype.setBrush = function() {
	var self = this
	var updateFunction = function() {
		var extent = self.brush.extent().map(function(d) {return typeof(self.settings.round) == 'function' ? self.settings.round(d): d})
		if(extent[0].valueOf() == extent[1].valueOf()) {
			self.settings.dimension.filter(null)
			self.settings.limits =[self.settings.xmin, self.settings.xmax]
			self.rangeDiv.selectAll('.reset').style('opacity', '.3').style('cursor', 'auto')
		}
		else {
			self.settings.limits = extent
			self.settings.dimension.filterRange(self.settings.limits);
			self.rangeDiv.selectAll('.reset').style('opacity', '1').style('cursor', 'pointer')
		}
		d3.select('#' + self.settings.id + '-range-div span').text(self.settings.titleFormatter(self.settings.limits))
		self.settings.updateAll()
	}
	self.brushstart = function() {
		updateFunction()
	}
	
	
	self.brushend = function() {
		updateFunction()
	}
	
	self.brushmove = function() {
		updateFunction()
	}
		
	self.brush = d3.svg.brush()
		.x(self.settings.x)
		.on("brushstart", self.brushstart)
		.on("brush", self.brushmove)
		.on("brushend", self.brushend);
}

Bar.prototype.update = function() {
	var self = this
	self.g.selectAll('.bar').transition().duration(500)
		.attr('height', function(d) {return self.settings.height - self.settings.y(d.value)})
		.attr('y', function(d) {return self.settings.y(d.value)})
		.attr('class', function(d) {
			var klass = (d.key<self.settings.limits[0] | d.key>self.settings.limits[1]) ? 'bar gray' : 'bar'
			return klass
		})
}


