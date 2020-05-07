const passport = require('passport');
const local_strategy = require('passport-local').Strategy;
const mongoose = require("mongoose");
const User = mongoose.model("User");

passport.use(new local_strategy(async (username, password, done) => {
	  User.findOne({ username }, async (err, user) => {
	  if(err){
	  		return done(err)
	  	}
	  if (!user) {
	   	return done(null, false, {message: 'Incorrect password or login'})
	   }
	   const valid = await User.validPassword(password, user);
	  if (!valid) {
	    return done(null, false, {message: 'Incorrect password or login'})
	  }else{
	  	return done(null, user)
	  }	    
	});    
}))