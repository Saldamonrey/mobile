const mongoose = require("mongoose");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const config = 'Salih';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  nickname: {
    type: String,
    required: true
  },
  activate_token: {
    type: String,
    required: true
  },
  reset_code: {
  	type: String,
  },
  activated: {
    type: Boolean
  },
  number: {
  	type: String,
  	required: true
  },
  calls_history: {
  	date:String,
  	user: {type: mongoose.Schema.ObjectId, ref: 'User'}
  },
  avatar: {
    type: String,
    required: false
  },
  media: [{source:{uri:String}}],
  salt: String,
  chats: [{type: mongoose.Schema.ObjectId, ref: 'Chat'}],
  block_list: [{type: mongoose.Schema.ObjectId, ref: 'Chat'}] 
});

UserSchema.statics.generateJwt = (user) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      exp: parseInt(expiry.getTime() / 1000)
    },
    config
  );
};

UserSchema.statics.setPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  return {
    password: crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex"),
    salt: salt
  };
};

UserSchema.statics.generateToken = function() {
  var rand = crypto.randomBytes(8).toString("hex");
  return rand;
};

UserSchema.statics.generateCode = function() {
  var rand = crypto.randomBytes(5).readUInt16LE();
  // console.log(rand)
  rand = rand.toString().substr(0,5);
  return rand;
};

UserSchema.statics.validPassword = (password, user) => {
  const hash = crypto
    .pbkdf2Sync(password, user.salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === user.password;
};

const User = mongoose.model("User", UserSchema);
