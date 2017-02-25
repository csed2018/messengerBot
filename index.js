'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('superagent');

const cred = require('./src/credentials');
const MessageHandler = require('./src/message-handler');

const messageHandler = new MessageHandler();
const app = express();

app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === cred.verifyToken) {
    return res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

/* receiving and handeling messages */
app.post('/webhook', (req, res) => {
  const messagingEvents = req.body.entry[0].messaging;
  
  messagingEvents.forEach((event) => {
    const sender = event.sender.id;
    console.log("get message from user: ", sender);
    if (event.postback)
      console.log("get postback with payload: ", event.postback.payload);
    let replys = messageHandler.getReply(event) || [];
    sendMessages(sender, replys);
  });
  res.sendStatus(200);
});

function sendMessages(recipient, messages, index){
  if (!index)
    index = 0;
  if (index >= messages.length)
    return;
  request
    .post('https://graph.facebook.com/v2.6/me/messages')
    .query({access_token: cred.pageToken})
    .send({
      recipient: {
        id: recipient
      },
      message: messages[index]
    })
    .end((err, res) => {
      if (err)
        console.log("ERRRORRRRRRRRRRRROOOOORRROROROOROR");
      if (res.body.error) {
        console.error('Error sending message ', res.body.error);
      }
      sendMessages(recipient, messages, index + 1);
    });
}

app.post('/token', (req, res) => {
  if (req.body.verifyToken === cred.verifyToken) {
    cred.pageToken = req.body.token;
    return res.sendStatus(200);
  }
  res.sendStatus(403);
});

app.get('/token', (req, res) => {
  if (req.body.verifyToken === cred.verifyToken) {
    return res.send({token: cred.pageToken});
  }
  res.sendStatus(403);
});

/* Request to update my own version of data */
app.post('/update', (req, res) => {
  console.log("recieved updating post request");
  if (req.body.verify_token == cred.verifyToken) {
    messageHandler.assignments.grapData();
    messageHandler.scheduleData.grapData();
    res.send("updated");
  }
  res.sendStatus(403);
});

/* Request to update my own version of data */
app.post('/notify', (req, res) => {
  console.log("recieved notify post request");
  if (req.body.verify_token == cred.verifyToken) {
    if(req.body.eventName && req.body.messages) {
      messageHandler.assignments.grapData();
      messageHandler.scheduleData.grapData();
      console.log("Updated data");
      res.send("users notified");
      messageHandler.notify(req.body.eventName, req.body.messages, sendMessages);
    } else {
      res.sendStatus(402);
    }
  } else {
    res.sendStatus(403);
  }
});

app.listen(process.env.PORT || 55555);
