'use strict';

var request = require("superagent");
var credentials = require("./src/credentials");

request
    .post('https://graph.facebook.com/v2.6/me/thread_settings?access_token='.concat(credentials.pageToken))
    .set('Content-Type',  'application/json')
    .send({
        "setting_type" : "call_to_actions",
        "thread_state" : "existing_thread",
        "call_to_actions":[
          {
            "type":"postback",
            "title":"Next 24 hours assignments",
            "payload":"next24hoursassignments"
          },
          {
            "type":"postback",
            "title":"Next 7 days assignments",
            "payload":"next7daysassignments"
          },
          {
            "type":"postback",
            "title":"Next day schedule",
            "payload":"nextdayschedule"
          },
          {
            "type":"postback",
            "title":"Subscribe/Unsubscribe",
            "payload":"subscribe"
          },
          {
            "type":"web_url",
            "url":"http://csed2018.github.io?source=fbot",
            "title":"Open Website",
            "webview_height_ratio": "tall",
          }
        ]
    })
    .end((err, res) => {
        if (err) {
            console.log('Error creating menu: ', err);
        } else if (res.body.error) {
            console.log('Error: ', res.body.error);
        }
        console.log("menu is added");
    });
