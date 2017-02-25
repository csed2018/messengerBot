var Utils = {};

Utils.WEEK_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
                 "Friday"];
Utils.DAY = 24 * 60 * 60 * 1000;
Utils.WEEK = 7 * Utils.DAY;

Utils.getDayID = function(day) {
  for (var i = 0; i < Utils.WEEK_DAYS.length; i++)
    if (Utils.WEEK_DAYS[i] == day)
      return i;
  return NaN;
}

Utils.nextDay = function(nowTime) {
  var tmpDate = new Date(nowTime + 2 * 3600000); // update every day 10 pm
  return (tmpDate.getDay() + 1) % 7;
}(Date.now());

Utils.getDayName = function(dateObj) {
  return Utils.WEEK_DAYS[(dateObj.getDay()+1)%7];
}

Utils.isAhead = function(date){
  return (date > Date.now());
}

Utils.deltaNow = function(date) {
  return date - Date.now();
}

Utils.inWeek = function(d){    
  return Utils.isAhead(d) && Utils.deltaNow(d) < Utils.WEEK;
}

Utils.inDay = function(d){  
  return Utils.isAhead(d) && Utils.deltaNow(d) < Utils.DAY;
}

Utils.millisecondsToUnits = function(time) {
    time = time < 0 ? 0 : time;
    time = Math.floor(time/1000);
    var days = Math.floor(time/(24*60*60));
    time = time % (24*60*60);
    var hours = Math.floor(time/(60*60));
    time = time % (60*60);
    var minutes = Math.floor(time/60);
    time = time % 60;
    return {
        seconds: time,
        minutes: minutes,
        hours: hours,
        days: days
    };
}

/**
  @brief: put the given time in time units (years, days, hours, minutes, seconds)
  and return first (num) units starting from non-zero unit and last-one rounded
  @returns: up-rounded (num) of
  @param: time: time in milliseconds
  @param: num: number of
*/
Utils.roundTime = function(time, num) {
  if(num <= 0) return {};
  var date = Utils.millisecondsToUnits(time);
  var units = [
      {value: date.days, label: "day"},
      {value: date.hours, label: "hour", max: 24},
      {value: date.minutes, label: "minute", max: 60},
      {value: date.seconds, label: "second", max: 60}
  ];
  num = Math.min(units.length, num);
  
  // round up all units not requested
  for (var i = units.length - 1; i >= num; i--) {
    if (units[i].value > 0.5 * units[i].max) {
      units[i].value = 0;
      units[i-1].value++;
    }
  }
  var ret = [];
  // find first non-zero element unit
  var i = 0;
  for(; i < units.length - num; ++i) {
    if (units[i].value > 0) break;
  }
  for(var j = 0; j < num; j++, i++) {
    if(units[i].value != 1) units[i].label += "s";
    ret.push({value: units[i].value, label: units[i].label});
  }
  return ret;
}

module.exports = Utils;
