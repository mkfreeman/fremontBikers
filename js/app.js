// App function-object
var App = function(sets) {
	var self = this
	self.settings = sets
	self.updateCharts = function() {
		// reset title
		var numBikers = self.cf.groupAll().reduceSum(function(d) {return d.value}).value()
		var title = numBikers == self.total ? 'Bikers that Crossed the Fremont Bridge: ' + settings.formatters.number(numBikers) : 'Bikers that Crossed the Fremont Bridge: ' + settings.formatters.number(numBikers) + ' (' + settings.formatters.percent(numBikers/self.total) + ')'
		d3.select('#header-text').text(title)
		self.charts.map(function(chart){
			if(typeof(chart.update == 'function')) {
				chart.update()
			}
		})
	}
	self.init()
}

App.prototype.init = function() {
	var self = this
	d3.csv("data/bridge_data.csv", function(error, rawData) {
		self.rawData = rawData
		self.prepData()
		self.build()
	})
}

App.prototype.prepData = function() {
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
	self.cf = crossfilter(self.data)
	self.total = self.cf.groupAll().reduceSum(function(d) {return d.value}).value()
	d3.keys(settings.charts).map(function(chart) {
		settings.charts[chart].dimension = self.cf.dimension(settings.charts[chart].dimensionFunc)
		settings.charts[chart].data = typeof(settings.charts[chart].groupFunc) == 'function' ? settings.charts[chart].dimension.group(settings.charts[chart].groupFunc).reduceSum(function(d) {return d.value}): settings.charts[chart].dimension.group().reduceSum(function(d) {return d.value})
		settings.charts[chart].total = self.total
		settings.charts[chart].updateAll = self.updateCharts
		console.log('all data ', settings.charts[chart].data.all())
	})
}

App.prototype.build = function() {
	var self = this
	var numBikers = settings.formatters.number(self.cf.groupAll().reduceSum(function(d) {return d.value}).value())
	d3.select('#header-text').text('Bikers that Crossed the Fremont Bridge: ' + numBikers)
	self.charts = []
	d3.keys(settings.charts).map(function(chart, index) {
		self.charts[index] = settings.charts[chart].type == 'bar' ? new Bar(settings.charts[chart]) : new Pie(settings.charts[chart])
		d3.select('#' + chart)
	})
}

App.prototype.renderAll = function() {
	var self = this
}

