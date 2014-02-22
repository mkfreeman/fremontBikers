var t = test.rawData.slice(100,110)
var dat = []
t.map(function(d) {dat.push({id:d.Date, xvalue:d['Fremont Bridge NB'], yvalue:direction:'north'});dat.push({id:d.Date, value:d['Fremont Bridge SB'], direction:'south'})})

// cf object
var cf = crossfilter(dat)

// set direction dimension
var directionDim = cf.dimension(function(d) {return d.direction})

// filter to only south 
directionDim.filter('south')

// see that only 10 of 20 observations remain
cf.groupAll().value()

// remove filter
directionDim.filter(null)

// add dimension to directionDim
directionDim