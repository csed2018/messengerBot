'use strict';

var request = require("superagent");
var credentials = require("./src/credentials");

request
    .post('https://graph.facebook.com/v2.6/me/thread_settings?access_token='.concat(credentials.pageToken))
    .set('Content-Type',  'application/json')
    .send({
        "setting_type" : "call_to_actions",
        "thread_state" : "new_thread",
        "call_to_actions":[
          {
            "payload":"__getstarted__"
          }
        ]
    })
    .end((err, res) => {
        if (err) {
            console.log('Error creating menu: ', err);
        } else if (res.body.error) {
            console.log('Error: ', res.body.error);
        }
        console.log("get started button is added");
    });

request
    .post('https://graph.facebook.com/v2.6/me/thread_settings?access_token='.concat(credentials.pageToken))
    .set('Content-Type',  'application/json')
    .send({
        "setting_type":"greeting",
        "greeting":{ // limit to 160 char
          "text":"Are you a CSED Student? Don't get lost among assignments any more. Coming assignments and schedule now at your fingertips."
        }
    })
    .end((err, res) => {
        if (err) {
            console.log('Error creating menu: ', err);
        } else if (res.body.error) {
            console.log('Error: ', res.body.error);
        }
        console.log("greeting text is added");
    });
      
