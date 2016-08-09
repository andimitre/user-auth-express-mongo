var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  favoriteBook: {
    type: String,
    required: true,
    trim: true
  }
  // removing password for passport auth
  // ,
  // password: {
  //   type: String,
  //   required: true,
  //   trim: true
  // }
});
// authenticate input against the db
UserSchema.statics.authenticate = function(email, password, callback){
  User.findOne({email: email})
    .exec(function(error, user){
    if (error) {
      return callback(error);
    } else if (!user) {
      var err = new Error('User not found');
      err.status = 401;
      return callback(err);
    }
    bcrypt.compare(password, user.password, function(error, result){
      if (result === true) {
        return callback(null, user);
      } else {
        return callback();
      }
    });
  });
};

// hash password before saving to db
// before saving the object apply the hash
UserSchema.pre('save', function(next){
  var user = this;
  // use bcrypt.hash for hashing
  bcrypt.hash(user.password, 10, function(err, hash){
    // supply the users password, how many times to apply the encryption algo, and a callback
    if (err){
      return next(err);
    } else {
      user.password = hash;
      next();
    }
  })
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
