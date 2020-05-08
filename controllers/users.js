let mongoose = require("mongoose");
let User = mongoose.model("User");
var Chat = mongoose.model("Chat");
let passport = require('passport');
let path = require('path');
// const accountSid = 'AC35ed689e66b4f277d0d48b607223a843';
// const authToken = '8bf89cab6eae6384d878a98a73db8907';
// const client = require('twilio')(accountSid, authToken);
const mail = require("../mailer");
var multer = require("multer");
var fs = require('fs');
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "static");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

var upload = multer({ storage: storage }).single("photo");
module.exports.login = async function(req, res, next) {
  console.log(req.body)
  passport.authenticate('local', (err, passportUser, info) => {
    if(err){
      return next(err);
    }
    if(passportUser){
      if(passportUser.activated){
      res.json({
        success: true,
        token: User.generateJwt(passportUser)
      });
    } else{
      res.json({
        success: false,
        message: "Вы не активировали почту или ввели" 
      });
    }
    } else{
      console.log(123)
      res.status(200).json({
        success: false,
        message: "Вы ввели неправильно почту или пароль" 
      });
    }
  }) (req, res, next)
};

module.exports.profile = async function(req, res, next) {
  if (!req.user) {
    res.status(200).json({
      message: "UnauthorizedError: private profile"
    });
  } else{
    User.findById({_id:req.user._id}, "-media._id")
    .populate({path:"chats", select:"_id members last_message", 
      populate: [{path: "members", select:"_id nickname avatar number"}, 
      {path: "last_message", select:"_id text user createdAt"}]
    })
    .exec(async function(err, user) {
      user.chats = user.chats.filter(chat => {
        if(!user.block_list.includes(chat._id)){
          return chat
        }
      })
      // user.last_message.time = await changeDate(user.last_message.createdAt)
      res.status(200).json({userdata:user});
    });
  }
};

function changeDate(date){
  const changeData = new Date(date)
  var hours = changeData.getHours();
  var minutes = changeData.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  minutes = minutes < 10 ? '0'+minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
}

module.exports.getIdByNickname = async function(req, res, next) {
  if(req.body.nickname.length>3){
    console.log('$regex:^req.body.nickname')
    User.find({nickname:{$regex:req.body.nickname, $options: 'i'}, _id:{$ne:req.user._id}}, "_id username nickname avatar")
      .exec(async function(err, user) {
        console.log(user)
        res.status(200).json({userdata:user});
    });
  } else{
    res.status(200).json({success:false, result:"less than 4 symbols"});
  }
};

module.exports.signup = async function(req, res, next) {
const { username, password, email, number } = req.body;
console.log(req.body)
  const userData = await User.setPassword(password);
  const token = await User.generateToken();
  const newuser = await User.create({
    username,
    number,
    password: userData.password,
    activated: false,
    email: email,
    nickname: username,
    activate_token:token,
    salt: userData.salt
  });
  if (!newuser) {
    return res.status(200).json({
      message: "Please pass correct username and passwords."
    });
  } else {
    mail.sendToken("http://92.53.124.246:3001/verify/" + token, email).then(result => {
        let send = result.smtpTransport.sendMail(result.mailOptions, function(
          error,
          info
        ) {
        if (error) {
          console.log(error);
          return res.json({ success: false, msg: "Message not send." });
          } else {
            console.log(info.response);
            return res.json({ success: true, msg: "Message send." });
          }
          });
      });
    }
};

module.exports.verify = async function(req, res, next) {
  const { token } = req.params;
  User.updateOne(
    { activate_token: token },
    {
      $set: {
        activated:true
      }
    }
  ).exec(function(err, post) {
    if (err || post.nModified == 0) {
      console.log(post);
      return res.sendFile(path.join(__dirname, "../public", "index_error.html"));
    }
    res.sendFile(path.join(__dirname, "../public", "index_success.html"));
  });
};

module.exports.setNickname = async function(req, res, next) {
  const { _id } = req.user;
  User.updateOne(
    { _id: _id },
    {
      $set: {
        nickname:req.body.nickname
      }
    }
  ).exec(function(err, post) {
    if (err || post.nModified == 0) {
      // console.log(post);
      return res.status(200).json({
        success: false,
        message: "Ошибка с присвоением нового псевдонима" 
      });
    }
    res.status(200).json({
        success: true,
        message: "Все корректно изменено",
        nickname: req.body.nickname
      });
  });
};

module.exports.setAvatar = async function(req, res) {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(200).json(err);
    } else if (err) {
      console.log(err);
      return res.status(200).json(err);
    }
    let maxsize = 20 * 1024 * 1024;
    let supportMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
    if (req.file.size > maxsize) {
         fs.unlinkSync(req.file.path);
         return res.json({success: false, msg: 'File is so more than 2 Mb'});
       }
    if(supportMimeTypes.indexOf(req.file.mimetype) == -1) {
        fs.unlinkSync(req.file.path);
        return res.json({success: false, msg: 'Unsupported mimetype'});
    }
    let user = await User.findById(req.user._id);
    try {
      fs.unlinkSync(user.avatar);
    } catch (err) {}
    const { _id } = req.user;
    User.updateOne(
      { _id: _id },
      {
        $set: {
          avatar:req.file.path.replace(/\\/g, '/')
        }
      }
    ).exec(function(err, post) {
      if (err || post.nModified == 0) {
        return res.status(200).json({
          success: false,
          message: "Ошибка с присвоением аватара" 
        });
      }
      res.status(200).json({
          success: true,
          avatar: req.file.path,
          message: "Все корректно изменено" 
        });
    });
  });
};

module.exports.sendResetCode = async function(req, res, next) {
const { email } = req.body
const code = await User.generateCode();
User.updateOne(
    { email: email },
    {
      $set: {
        reset_code:code
      }
    }
  ).exec(function(err, post) {
    if (err || post.nModified == 0) {
      // console.log(post);
      return res.status(200).json({
        success: false,
        message: "Ошибка со сменой пароля" 
      });
    }
    mail.sendResetCode(code, email).then(result => {
        let send = result.smtpTransport.sendMail(result.mailOptions, function(
          error,
          info
        ) {
        if (error) {
          console.log(error);
          return res.json({ success: false, msg: "Message not send." });
          } else {
            console.log(info.response);
            return res.json({ success: true, msg: "Code send." });
          }
          });
      });
  }); 
};

module.exports.checkReset = async function(req, res, next) {
const { code } = req.body
  User.find({ reset_code: code })
  .exec(function(err, chat) {   
    res.status(200).json(chat);
  });
};

module.exports.resetPassword = async function(req, res, next) {
const { code, password } = req.body
console.log(password)
const userData = await User.setPassword(password);
  User.updateOne(
    { reset_code: code },
    {
      $set: {
        password:userData.password,
        reset_code:null
      }
    }
  ).exec(function(err, post) {
    if (err || post.nModified == 0) {
      return res.json({ success: false, msg: "Password not change." });
    }
    return res.json({ success: true, msg: "Password change." });
  });
};

module.exports.addImage = async function(req, res, next) {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(200).json(err);
    } else if (err) {
      console.log(err);
      return res.status(200).json(err);
    }
    let maxsize = 20 * 1024 * 1024;
    let supportMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
    if (req.file.size > maxsize) {
         fs.unlinkSync(req.file.path);
         return res.json({success: false, msg: 'File is so more than 2 Mb'});
       }
    if(supportMimeTypes.indexOf(req.file.mimetype) == -1) {
        fs.unlinkSync(req.file.path);
        return res.json({success: false, msg: 'Unsupported mimetype'});
    }
    try {
      fs.unlinkSync(user.avatar);
    } catch (err) {}
    const { _id } = req.user;
    User.findByIdAndUpdate(req.user._id, {$addToSet: {media: {source:{uri:"http://92.53.124.246:3001/"+req.file.path.replace(/\\/g, '/')}}}}, (err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    } else{
      return res.json({ success: true, msg: "Image added." });
    }
  })
  });
};


