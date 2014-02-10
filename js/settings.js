var settings = {
	height:300,
	dataPath:'data/bridge_data.csv', 
	formatters: {
		number: d3.format(",d"),
      	date: d3.time.format("%B %d, %Y"),
      	time: d3.time.format("%I:%M %p"),
      	percent: d3.format('%0'), 
      	titleDate: function(d) {
			var monthNames = [ "Jan.", "Feb.", "March", "April", "May", "June",
					 "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec." ];
			var month = monthNames[d.getMonth()]
			var date = d.getDate()
			var year = d.getFullYear()
			return month + ' ' + date + ', ' + year	
		}, 
		titleTime:function(d) {
			var d = Math.round(d)
			var hour = (d == 0 | d == 12 | d == 24)? "12" : String(d%12);
			var meridian = d<12 ? "AM" : "PM"
			var time = hour + ':00 ' + meridian
			return time
		}
	},


}