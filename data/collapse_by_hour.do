insheet using "C:\Users\mikefree\Downloads\Divvy_Trips_2013.csv", clear comma names
gen count = 1
split(starttime), p(:)
replace starttime1 = starttime1 + ":00"
drop starttime starttime2
rename starttime1 starttime
collapse(sum) count, by(gender starttime) fast
outsheet using "C:\Users\mikefree\Downloads\Divvy_Trips_2013_by_hour.csv", comma replace
