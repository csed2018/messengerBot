'use strict';

var AssignmentsData = require('./assignments-data');
var ScheduleData = require('./schedule-data');
var UsersData = require('./users-data');
var Utils = require('./time-utils');

function Handler() {
  this.assignments = new AssignmentsData();
  this.assignments.grapData();
  this.scheduleData = new ScheduleData();
  this.scheduleData.grapData();
  this.usersData = UsersData.getInstance();
}

Handler.prototype.getReply = function(event) {
  if(event.sender)
    this.usersData.addUser(event.sender.id, (err, res)=>{
      console.log("ADDED USER", err == null);
  });
  if(event.postback) {
    return this.handlePostbacks(event.postback.payload, event);
  } else if (event.message && event.message.text) {
    var postbackReply = this.handlePostbacks(event.message.text.replace(/\s+/gm, '').toLocaleLowerCase(), event);
    return postbackReply || [{text: 'I don\'t understand any text sent to me other than the commands in the menu, sorry! :( type "help" to know more'}];
  }
  return null;
}

function matchWithList(obj, list) {
  if (!list)
    return false;
  for(var i = 0; i < list.length; i++)
    if (list[i] === obj)
      return true;
  return false;
}

Handler.prototype.handlePostbacks = function(payload, event) {
  console.log("analysing payload:", payload);
  if (matchWithList(payload, ["next24hoursassignments", "24hours", "24"])) {
    return this.getNext24H();
  } else if (matchWithList(payload, ["next7daysassignments", "week", "7days", "7"])) {
    return this.getNext7Days();
  } else if (matchWithList(payload, ["nextdayschedule", "nextday", "tomorrow", "schedule", "table"])) {
    return this.getNextDay();
  } else if (matchWithList(payload, ["help"])) {
    return this.getHelp();
  } else if (payload.startsWith("subscribe-to-")) {
    return this.subscribe(payload.substr("subscribe-to-".length), event.sender.id);
  } else if (payload.startsWith("subscribe-from-")) {
    return this.unsubscribe(payload.substr("subscribe-from-".length), event.sender.id);
  } else if (payload.startsWith("subscribe")) {
    return this.getSubscribtionButtons(event.sender.id);
  } else if (payload === "__getstarted__") {
    return this.getWelcomeMessage();
  }
  console.log("Didn't find any match for it");
  return null;
}

Handler.prototype.getNext24H = function() {
  var assList = this.assignments.getNext24h();

  if(assList.length == 0) {
    return [{ text: "Hooray! There are no assignments in the next 24 Hours =D" }];
  }

  var msgList = [{ text: "You have " + assList.length + " assignment/s in the next 24 Hours 3:)" }];
  for (var i = 0; i < assList.length; i++) {
    var remaining = Utils.roundTime (Math.abs(Utils.deltaNow(assList[i].deadline)), 2);
    msgList.push(
      {
        text: "\n[" + assList[i].subject + "]\n"
              .concat("\"" + assList[i].title + "\"")
              .concat("\nOn " + Utils.getDayName(assList[i].deadline) + " ")
              .concat((assList[i].deadline.getHours() + 2) + ":" + assList[i].deadline.getMinutes())
              .concat("\nRemaining: " + remaining[0].value + " " + remaining[0].label)
              .concat("\n")
      });
  }

  return msgList;
}

Handler.prototype.getNext7Days = function() {
  var assList = this.assignments.getNext7Days();

  if(assList.length == 0) {
    return [{ text: "Yeah! There are no assignments for the next week =D" }];
  }

  var msgList = [{ text: "You have " + assList.length + " assignment/s in the next 7 days 3:)" }];

  for (var i = 0; i < assList.length; i++) {
    var remaining = Utils.roundTime (Math.abs(Utils.deltaNow(assList[i].deadline)), 2);
    msgList.push(
      {
        text: "\n[" + assList[i].subject + "]\n"
              .concat("\"" + assList[i].title + "\"")
              .concat("\nOn " + Utils.getDayName(assList[i].deadline) + " ")
              .concat((assList[i].deadline.getHours() + 2) + ":" + assList[i].deadline.getMinutes())
              .concat("\nRemaining: " + remaining[0].value + " " + remaining[0].label)
              .concat("\n")
      });
  }

  return msgList;
}

Handler.prototype.getNextDay = function() {
  var nextDay = this.scheduleData.getNextDay();
  if(nextDay.length == 0) {
    return [{ text: "Well, it seems that the schedule is not confirmed yet :(" }];
  }
  var msgList = [{ text: nextDay[0].day }];
  for(var i = 0; i < nextDay.length; i++) {
      msgList.push(
        {
          text: "#" + nextDay[i].num + ": [" + nextDay[i].subject + "]"
                + " (" + nextDay[i].ptype + ")\n\n"
                + nextDay[i].notes
        });
  }
  msgList.push({ text: "Take Care :v If the day I send you is different than the acutal tomorrow, then the schedule is not confirmed yet B)" });
  return msgList;
}

Handler.prototype.getSubscribtionButtons = function() {
  if(!this.usersData.connected)
    return [{ text: "sorry subscription service is temporarily unavailable :'(" }];
  const subscribeList = [
    {
      payload: 'assignments',
      text: 'Assignments updates?'
    },
    {
      payload: 'schedule',
      text: 'Next day schedule updates?'
    },
    {
      payload: 'bot',
      text: 'Bot new features and development updates?'
    }
  ];
  var reply = [];
  for (var i = 0; i < subscribeList.length; i++) {
    reply.push({
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text": subscribeList[i].text,
          "buttons":[
            {
              "type":"postback",
              "title": "Subscribe",
              "payload": "subscribe-to-" + subscribeList[i].payload
            },
            {
              "type":"postback",
              "title": "Unsubscribe",
              "payload": "subscribe-from-" + subscribeList[i].payload
            },
          ]
        }
      }
    });
  }
  return reply;
}

Handler.prototype.subscribe = function(eventName, id) {
  this.usersData.setSubscribe(eventName, id, true);
  return [{
    text: "You are subscribed successfully to " + eventName + " updates ^_^"
  }];
}

Handler.prototype.unsubscribe = function(eventName, id) {
  this.usersData.setSubscribe(eventName, id, false);
  return [{
    text: "You are unsubscribed successfully from " + eventName + " updates"
  }];
}

Handler.prototype.notify = function (eventName, messages, sender) {
  this.usersData.getUsersOfEvent(eventName, (err, users)=>{
    if (err)
      return;
    if (eventName == 'schedule') {
      messages = messages.concat(this.getNextDay());
    }
    console.log("Notify about", eventName);
    users.forEach((user)=> {
      console.log("Notify user:", user.id);
      if (user.id)
        sender(user.id, messages);
    });
  });
};

Handler.prototype.getHelp = function() {
  return [
    {
      text: 'Hi there :D Thanks for talking to me!'
    },
    {
      text: 'The menu (the 3-caret icon on the left of the composer) contains commands to easily interact with me. You can use them or type them your self.'
    },
    {
      text: 'To get the assignments in the next 24 hours use the menu or type:\n "next 24 hours assignments", "24 hours" or just "24"'
    },
    {
      text: 'To get the assignments in the next 7 days use the menu or type:\n "next 7 days assignments", "week", "7 days" or just "7"'
    },
    {
      text: 'To get next day schedule use the menu or type:\n "next day schedule", "next day", "tomorrow", "schedule" or "table"'
    },
    {
      text: 'Edit your subscription preferences using Subscribe/Unsubscribe from the menu or just type "subscribe". By default your not subscribed to any notifcation messages.'
    },
    {
      text: "I'm still a baby bot :D so I don't understand any other text sorry! :( But I'll grow up soon ;)"
    },
    {
      text: 'You can view the website inside your messenger app (or new window on desktop) using "Open Website" from the menu. Open the website to get more informtion about the assignments (links, notes ..)'
    },
    {
      text: 'Take care! Till now, messages can be seen by the page admins. DO NOT share any private data here.'
    },
    {
      text: "If you have any complains or ideas, do not hesitate to contact the developer, facebook.com/IHazemSamir\n OR on github.com/csed2018/messengerbot/issues"
    }
  ];
}

Handler.prototype.getWelcomeMessage = function() {
  
  return [
    {
      text: "Hi :D"
    },
    {
      text: "If you are not an AlexU - CSED'18 student, you are welcomed. However, I don't see how I will be useful for you."
    },
    {
      text: "Let's start by setting your subscription preferences. You can recieve messages when an assignment is added or updated or when the schedule is confirmed."
    }
  ]
  .concat(this.getSubscribtionButtons())
  .concat([
    {
      text: 'Type "help" at any time to know more about what I can do :D'
    },
    {
      text: 'Thanks and have fun :D'
    }
  ]);
}

module.exports = Handler;
