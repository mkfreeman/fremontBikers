var settings = {
	container:'main',
	dataPath:'data/bridge_data.csv', 
	formatters: {
		number: d3.format(",d"),
      	date: function(d){ 
      		var formatter = d3.time.format("%B")
      		return formatter(d)
      	},
      	percent: d3.format('%0'), 
	},
	charts:{
		date:{
			id:'date', 
			type:'bar', 
			container:'main',
			dimensionFunc:function(d) { return d.date},
			groupFunc:d3.time.day,
 			// round:function(d) {return d3.time.dayOfYear(d) + d3.time.year(d)},
			height:270, 
			width:1030, 
				margin:{
				left:50, 
				right:50, 
				top:10, 
				bottom:20
			},
			x:d3.time.scale(),
			y:d3.scale.linear(), 
			ticks:{
				x:20,
				y:0
			},
			format:{
				x:d3.time.format("%B"),
				y:d3.format(",d")
			}, 
			title:'Bikers By Date',
			titleFormatter: function(limits) {
				var monthNames = [ "Jan.", "Feb.", "March", "April", "May", "June",
						 "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec." ];
				var text = ''
				limits.map(function(d,i) {
					var month = monthNames[d.getMonth()]
					var date = d.getDate()
					var year = d.getFullYear()
					text += month + ' ' + date + ', ' + year
					if(i == 0) text += '-'
				})
				return text
			}, 
			padding: {
				left:false,
				right:false
			}, 
			
		
		}, 
		time:{
			id:'time', 
			type:'bar', 
			container:'main',
			dimensionFunc:function(d) { return d.date.getHours() + d.date.getMinutes() / 60;},
			groupFunc:Math.floor,
			height:270, 
			width:300, 
				margin:{
				left:50, 
				right:50, 
				top:10, 
				bottom:20
			},
			x:d3.scale.linear(),
			y:d3.scale.linear(), 
			format:{
				x:d3.time.scale(), 
				y:d3.format(",d")
			},
			ticks:{
				x:12,
				y:0
			},
			title:'Bikers By Hour',
			titleFormatter:function(limits) {
				var text = ''
				var hours = {}
				console.log(limits)
				if(Math.floor(limits[0]) == Math.floor(limits[1])) return 'none'
				limits.map(function(d,i) {
					var d = i == 0 ? Math.ceil(d) : Math.ceil(d)
					var hour = (d == 0 | d == 12 | d == 24)? "12" : String(d%12);
					var meridian = d<12 ? "AM" : "PM"
					var time = hour + ':00 ' + meridian
					hours[i] = time
					text += time
					if (i == 0) text += '-'
				})
				if(text == '12:00 AM-12:00 PM') return 'All Hours'
				return text
			},
			padding: {
				left:.3,
				right:.3
			}

		}, 
		day:{
			id:'day', 			
			type:'bar', 
			container:'main',
			dimensionFunc:function(d) { return d.date.getDay()},
			groupFunc:'none',
			height:270, 
			width:300, 
				margin:{
				left:50, 
				right:50, 
				top:10, 
				bottom:20
			},
			x:d3.scale.linear(),
			y:d3.scale.linear(), 
			format:{
				y:d3.format(",d"), 
				x:function(d) {
					var fullDayNames = ['Sun.', 'Mon.', 'Tues.', 'Weds.', 'Thurs.', 'Fri.', 'Sat.']
					return fullDayNames[d]
				}
			},
			ticks:{
				x:7,
				y:0
			},
			title:'Bikers By Weekday',
			titleFormatter: function(limits) {
				var fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
				var text = ''
				if(Math.ceil(limits[0]) > Math.floor(limits[1])) return 'none'
				var days = {}
				limits.map(function(d,i) {
					var day = i == 0 ? fullDayNames[Math.ceil(d)] : fullDayNames[Math.floor(d)]
					days[i] = day
					text += day
					if(i == 0) text += '-'
				})
				if(days[0] == days[1]) return days[0] + 's'
				if(text == 'Sunday-Saturday') return 'All Days'
				return text
			}, 
			padding: {
				left:.3,
				right:.3
			}
		},
		direction:{
			id:'direction', 
			type:'pie', 
			container:'main',
			dimensionFunc:function(d) { return d.direction},
			groupFunc:'none',
			height:270, 
			width:300, 
				margin:{
				left:10, 
				right:20, 
				top:10, 
				bottom:20
			},
			radius:135,
			format: {
				y:d3.format(",d"), 
			},
			title:'Bikers By Direction',
			colors:['steelblue', 'orange'], 
			poshy:function(chart) {
				$('#' + chart.settings.id + '-svg .arc').poshytip({
					slide: false, 
					followCursor: true, 
					alignTo: 'cursor', 
					showTimeout: 0, 
					hideTimeout: 0, 
					alignX: 'center', 
					alignY: 'inner-bottom', 
					className: 'tip',
					offsetY: 10,
					content: function(a,tip){
						var text = ''
						var dir = this.__data__.data.key == 'north' ? 'Northbound' : 'Southbound'
 						var bikers = chart.settings.format.y(this.__data__.data.value)
						text += '<b>' + dir + '</b></br>'
						text += 'Bikers: ' + bikers
						return text
						// return self.content(this.__data__.properties.location_id)
					}
				})
			
			}
		}
	
	}


}