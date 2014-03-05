// App function-object
var App = function(sets) {
	var self = this
	self.settings = sets
	self.updateCharts = function() {
		// reset title
		var numBikers = self.cf.groupAll().reduceSum(function(d) {return d.value}).value()
		var title = numBikers == self.total ? 'Bikers: ' + settings.formatters.number(numBikers) : 'Bikers: ' + settings.formatters.number(numBikers) + ' (' + settings.formatters.percent(numBikers/self.total) + ')'
		d3.select('#header-text').text(title)
		self.charts.map(function(chart){
			if(typeof(chart.update == 'function')) {
				chart.update()
			}
		})
	}
	self.init()
}
var data
App.prototype.init = function() {
	var self = this
	d3.csv("data/Divvy_Trips_2013_by_hour.csv", function(error, rawData) {
		console.log('raw data ', rawData)
		data = rawData
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
		self.data.push({
			index:index,
			starttime:new Date(d.starttime),
			sex:d.gender == '' ? 'Non-Member' : d.gender,
			value:d.count
		})
		index += 1
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
	d3.select('#header-text').text('Bikers: ' + numBikers)
	self.charts = []
	d3.keys(settings.charts).map(function(chart, index) {
		self.charts[index] = settings.charts[chart].type == 'bar' ? new Bar(settings.charts[chart]) : new Pie(settings.charts[chart])
		d3.select('#' + chart)
	})
}

App.prototype.renderAll = function() {
	var self = this
}

