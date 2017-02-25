'use strict';

const request = require('superagent');
const TimeUtils = require('./time-utils')

function AssignmentsData() {
  this.allAssignments = [];
  this.activeAssignments = [];
  this.pastAssingments = [];
};

AssignmentsData.prototype.getNext24h = function() {
  return this.getWithin(TimeUtils.DAY);
}

AssignmentsData.prototype.getNext7Days = function() {
  return this.getWithin(TimeUtils.WEEK);
}

AssignmentsData.prototype.getWithin = function(range) {
  if (this.activeAssignments.length > 0 && !TimeUtils.isAhead(this.activeAssignments[0]))
    this._updateAssignments();
  var ret = [];
  for (var i = 0; i < this.activeAssignments.length; i++) {
    if (TimeUtils.deltaNow(this.activeAssignments[i].deadline) < range)
      ret.push(this.activeAssignments[i]);
  }
  return ret;
}

AssignmentsData.prototype._updateAssignments = function() {
  this.activeAssignments = [];
  this.pastAssingments = [];
  for (var i = 0; i < this.allAssignments.length; i++) {
    if (TimeUtils.isAhead(this.allAssignments[i].deadline)) {
      this.activeAssignments.push(this.allAssignments[i]);
    } else {
      this.pastAssingments.push(this.allAssignments[i]);
    }
  }
  
  this.activeAssignments.sort((a, b)=> {
    return (a.deadline - b.deadline);
  });
  
  this.pastAssingments.sort((a, b)=> {
    return (b.deadline - a.deadline);
  });
}

AssignmentsData.prototype.grapData = function() {
  request.get('https://spreadsheets.google.com/feeds/list/1pBZaLcIZ8o2t6HoylMwun4EranZF4i2KvFoG5OmtNio/oltjd19/public/values?alt=json')
  .end((err, res) => {
    if (err) {
      console.log('Error grab assinments from google docs: ', err);
    } else if (res.body.error) {
      console.log('Error grab assinments from google docs: ', res.body.error);
    } else if (res.body){
      res.body.feed = res.body.feed || {entry: []};
      var dataEntryArr = res.body.feed.entry;
      this.allAssignments = [];
      for(var i = 0; i < dataEntryArr.length; i++) {
          var row = {};
          var entry =  dataEntryArr[i];
          row.subject = entry.gsx$subject.$t;
          row.title = entry.gsx$title.$t;
          var tmpDate = new Date(entry.gsx$date.$t + "T" + entry.gsx$time.$t + "Z");
          // subtract two hours (2 * 60 * 60 * 1000) to be in UTC
          row.deadline = new Date(tmpDate.getTime() - 7200000);
          row.description = entry.gsx$description.$t || "";
          if (row.subject && row.title && row.deadline.getTime())
            this.allAssignments.push(row);
      }
      this._updateAssignments();
    }
  });
}

module.exports = AssignmentsData;
