// sums
flight = crossfilter(flights)
var nbs = flight.groupAll().reduceSum(function(d) {return d.north}).value()
var total = flight.groupAll().reduceSum(function(d) {return d.north + d.south}).value()


// month dimension
var monthDim = flight.dimension(function(d) {return d.date.getMonth()})

// biker hours per month
var monthBikerHours = monthDim.group().reduceCount()

// nb bikers per month
var monthNbBikers = monthDim.group().reduceSum(function(d) {return d.north})

