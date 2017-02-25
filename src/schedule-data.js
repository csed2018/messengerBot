'use strict';

const request = require('superagent');
const TimeUtils = require('./time-utils')

function ScheduleData() {
  this.nextDay = [];
};

ScheduleData.prototype.getNextDay = function() {
  return this.nextDay;
}

ScheduleData.prototype.grapData = function() {
  request.get("https://spreadsheets.google.com/feeds/list/1pBZaLcIZ8o2t6HoylMwun4EranZF4i2KvFoG5OmtNio/oxukpy2/public/values?alt=json")
  .end((err, res) => {
    if (err) {
      console.log('Error grab assinments from google docs: ', err);
    } else if (res.body.error) {
      console.log('Error grab assinments from google docs: ', res.body.error);
    } else if (res.body){
      res.body.feed = res.body.feed || {entry: []};
      var dataEntryArr = res.body.feed.entry;
      this.nextDay = [];
      
      for(var i = 0; i < dataEntryArr.length; i++) {
        var period = {};
        period.day = dataEntryArr[i].gsx$day.$t;
        period.num = Number(dataEntryArr[i].gsx$period.$t);
        period.subject = dataEntryArr[i].gsx$subject.$t;
        period.ptype = dataEntryArr[i].gsx$type.$t;
        period.notes = dataEntryArr[i].gsx$note.$t;
        period.isNextDay = dataEntryArr[i].gsx$confirmed.$t === "nextDay";

        if (period.day && period.num && period.subject && period.ptype
            && period.isNextDay) {
          period.dayID = TimeUtils.getDayID(period.day);
          period.notes = period.notes;
          this.nextDay.push(period);
        }
      }
      this.nextDay.sort((a, b)=> { return a.num - b.num; });
    }
  });
}

module.exports = ScheduleData;
