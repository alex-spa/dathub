var Models = require('level-orm')
var level = require('level')
var util = require('util')
var bcrypt = require('bcrypt')

module.exports = Users

function Users(db) {
  // users is the sublevel name to user
  // handle is the primary key to user for insertion
  Models.call(this, { db: db }, 'users', 'handle');
}
util.inherits(Users, Models);

Users.prototype.create = function(data, cb, insecure) {
  // Creates a user given some data
  //
  // Parameters
  // - data: object
  //   expects handle, password, and email
  // - cb: function
  //   callback when complete
  // - insecure: boolean
  //   This is for benchmarking without bcrypt hit
  //   DO NOT USE FOR ANY OTHER PURPOSE
  var self = this

  if(!data['handle'] || !data['password'] || !data['email']) {
    return cb("can not create user without handle, password, and email in data", false)
  }

  // a few of the following 20 lines pulled from level-userdb 
  // https://github.com/FrozenRidge/level-userdb/blob/master/db.js
  var f = encryptPassword
  if (insecure) {
    f = function(password, cb) {
      return cb(null, password)
    }
  }
  f(password, function(err, pass) {
    data['password'] = pass
    data['createdTimestamp'] = new Date().getTime()
    self.save(data, cb)
  })
}

Users.prototype.login = function(handle, password) {
  // pulled from level-userdb 
  // https://github.com/FrozenRidge/level-userdb/blob/master/db.js
  this.get(handle, function(err, user) {
    if (err || !user) return cb("could not find user", false)
      bcrypt.compare(password.toString(), user.password.toString(), function(err, res) {
        if (err || !res) return cb("password mismatch", false)
        cb(null, user)
      })
  })
}

