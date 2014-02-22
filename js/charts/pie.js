var Pie = function(sets) {
	var self = this
	self.settings = sets
	self.data = self.settings.data
	self.init()
}

Pie.prototype.init = function() {
	var self = this
	self.arc = d3.svg.arc()
    	.outerRadius(self.settings.radius)
    	.innerRadius(0);

	self.pieLayout = d3.layout.pie()
		.sort(function(a,b) {return a.key<b.key})
   		.value(function(d) {return d.value; });
	
	self.build()
}

Pie.prototype.build = function() {
	var self = this
	self.div = d3.select('#' + self.settings.container).append('div').attr('id', self.settings.id + '-div').attr('class', 'chart')
	self.titleDiv = self.div.append('div').attr('id', self.settings.id + '-title-div').attr('class', 'title-div').text(self.settings.title)
	self.rangeDiv = self.div.append('div').attr('id', self.settings.id + '-range-div').attr('class', 'range-div')
	self.rangeDiv.append('span').text('Both')
	self.rangeDiv.append('span')
				.attr('class', 'reset')
				.text('reset')
				.on('click', function(){
					self.settings.dimension.filter(null)
					self.rangeDiv.selectAll('.reset').style('opacity', '.3').style('cursor', 'auto')
					self.rangeDiv.select('span').text('Both')
    				self.dataG.selectAll('.arc').attr('class', function(piece) {return 'arc'})
					self.settings.updateAll()				
				})	
	
	self.svg = self.div.append("svg")
				  .attr("width", self.settings.width + self.settings.margin.left + self.settings.margin.right)
				  .attr("height", self.settings.height + self.settings.margin.top + self.settings.margin.bottom)
				  .attr('id', self.settings.id + '-svg')
	
	self.g = self.svg.append("g")
				  .attr("transform", "translate(" + (self.settings.margin.left + self.settings.radius)+ "," + (self.settings.height/2 + 20) + ")");
	
	self.dataG = self.g.selectAll(".arc")
					.data(self.pieLayout(self.data.all()), function(d) {return d.data.key})
			    	.enter().append("g")	

 	self.dataG.append("path")
    			.attr("d", self.arc)
    			.attr('class', 'arc')
     			.style("fill", function(d,i) { return self.settings.colors[i]; })
     			.on('click', function(d) {
					self.rangeDiv.selectAll('.reset').style('opacity', '1').style('cursor', 'pointer')
     				self.settings.dimension.filter(d.data.key)
     				var direction = d.data.key == 'north' ? 'Northbound' : 'Southbound'
					d3.select('#' + self.settings.id + '-range-div span').text(direction)
     				self.dataG.selectAll('.arc').attr('class', function(piece) {return piece.data.key == d.data.key ? 'arc selected' : 'arc gray'})
     				self.settings.updateAll()
     			})
	 if(typeof(self.settings.poshy) == 'function') self.settings.poshy(self)
}

Pie.prototype.update =  function() {
	var self = this
	var currTotal = 0
	self.data.all().map(function(d) {currTotal += d.value})
	var newRadius = self.settings.radius*currTotal/self.settings.total
	self.arc = d3.svg.arc()
    	.outerRadius(newRadius)
    	.innerRadius(0);
    	
    // self.dataG.data(self.pieLayout(self.data.all()), function(d) {return d.data.key})
    self.dataG.selectAll('.arc').transition().duration(500).attr("d", self.arc)
	// $('#' + self.settings.id + '-svg .arc').poshytip('destroy')
	// if(typeof(self.settings.poshy) == 'function') self.settings.poshy(self)
}