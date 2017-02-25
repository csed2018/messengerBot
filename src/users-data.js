'use strict';

var mongoose = require('mongoose');
const cred = require('./credentials');

function UsersDataSinglton() {
  var instance;

  function createInstance() {
    var object = new UsersData();
    return object;
  }

  return {
    getInstance: function () {
      if (!instance)
        instance = createInstance();
      return instance;
    }
  };
};

function UsersData() {
  this.connected = true;
  mongoose.connect(cred.mongodbUrl, (err)=> {
    if(err) {
      console.error("cannot connect to mongodb");
      this.connected = false;
    }
  });
  
  var Schema = mongoose.Schema;
  var userSchema = new Schema({
    id: {type: String, unique: true},
    
    assignments: {type: Boolean, default: false},
    schedule: {type: Boolean, default: false},
    bot: {type: Boolean, default: false}
  });
  this.User = mongoose.model('users', userSchema);
}

UsersData.prototype.setSubscribe = function (eventName, id, subscribe, callback) {
  if (!this.connected) {
    if (callback)
      callback("db is not connected");
    return;
  }
  this.User.findOne({'id':id}, (err, user)=>{
    if(err) {
      console.error(err);
      return;
    }
    user[eventName] = subscribe;
    user.save((err)=>{
      if(err) console.error(err);
    });
  });
};

/* call back is callback(err, result), result=null if no match */
UsersData.prototype.getUser = function (id, callback) {
  if (!this.connected) {
    if (callback)
      callback("db is not connected");
    return;
  }
  this.User.findOne({'id': id}, callback);
};

/* call back is callback(err, result), result=[] if no match */
UsersData.prototype.getUsersOfEvent = function (eventName, callback)  {
  if (!this.connected) {
    if (callback)
      callback("db is not connected");
    return;
  }
  var query = {};
  query[eventName]=true;
  this.User.find(query, callback);
};

UsersData.prototype.addUser = function (id, callback) {
  if (!this.connected) {
    if (callback)
      callback("db is not connected");
    return;
  }
  this.User.create({'id': id}, callback);
};

module.exports = UsersDataSinglton();
