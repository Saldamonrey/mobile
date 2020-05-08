var mongoose = require("mongoose");
var multer = require("multer");
var fs = require('fs');
var Chat = mongoose.model("Chat");
var Message = mongoose.model("Message");
var User = mongoose.model("User");
var socket = require("../socket");

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

// module.exports.getTasks = async function(req, res) { 
//   if(req.body.group){
//    Task.find({ 
//     group: req.body.group,
//     status: { "$nin" : ["canceled"] }
//     }).sort({$natural:-1}).exec(function(err, post) { 
//     return res.status(200).json(post); 
//   });
//   }
//  else if(req.body.year) {
//     var date = new Date(parseInt(req.body.year), parseInt(req.body.month), parseInt(req.body.day));
//     Task.find({ 
//     date: date.toString(),
//     user_id: req.user._id,
//     status: { "$nin" : ["canceled"] }
//     }).sort({$natural:-1}).exec(function(err, post) { 
//     return res.status(200).json(post); 
//   }); 
//   }
//   else {
//    const groups = await User.find({ _id:req.user._id }).populate("groups","group_name");
//    var a = [];
//    for (var i = 0; i < groups[0].groups.length; i++) {
//      a[i]=groups[0].groups[i]._id
//    }
//    const group_tasks = await Task.find({ 
//       group: { "$in" : a},
//       mute : { "$nin" : [req.user._id] },
//       status: { "$nin" : ["canceled"] }
//      })
//    Task.find({ 
//       user_id: req.user._id,
//       group: { '$in': [""]},
//       status: { "$nin" : ["canceled"] }
//       }).sort({$natural:-1}).exec(function(err, post) {
//       post = post.concat(group_tasks) 
//     res.status(200).json(post); 
//   });
//   }
// };

module.exports.addMessages = async function(req, res) {
  console.log(req.body)
  const { id, text, chat_id, user, image } = req.body.message[0];
  const datetime = new Date();
  var newMessage = await new Message({
    _id:req.body._id,
    user: {_id:user._id, name:user.name, avatar:user.avatar},
    text: text,
    createdAt: datetime.toISOString(),
    chat_id: chat_id,
    image: image
  });
    newMessage.save(async function(err,data) {
      // await delete data.chat_id
      // console.log(data)
      if (err) {
        console.log(err);
        return res.json({ success: false, msg: "Error with message" });
      }
      //Для группы создаем
      await Chat.findByIdAndUpdate(chat_id, {
        $addToSet: {messages: data._id},
        $set: {last_message:data._id}
      });
     socket.sendMessage(data, chat_id);
     res.json({ success: true, msg: "Successful confirm task." });
    });
};

module.exports.uploadFile = async function(req, res) {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      console.log(err);
      return res.status(500).json(err);
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
    User.updateMany({'_id': {$in :[req.body.member[0]._id, req.body.member[1]._id]}}, 
        {$addToSet: {media: {source:{uri:"http://92.53.124.246:3001/"+req.file.path.replace(/\\/g, '/')}}}}, 
        (err, result) => {
          if(err) {
            console.log(err)
            return res.status(200).json({
            success: false,
            result: "Error"
          })
          }
          return res.status(200).json({
            success: true,
            image: req.file.path.replace(/\\/g, '/'),
            message: "Фото загружено" 
          });
        });
    }) 
};

module.exports.deleteImage = async function(req, res) {
  var str = "dfgdfg/fdgdfg/sfdsf"
// console.log(str.slice(str.lastIndexOf('/')))
//   console.log(req.body.path.slice(str.lastIndexOf('/')).replace('/','\\'))
  try {
    fs.unlinkSync(req.body.path);
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Фото не удалено" 
    });
  }
  res.status(200).json({
    success: true,
    message: "Фото удалено" 
  });
};

module.exports.addCall = async function(req, res) {
const datetime = new Date();
  User.findByIdAndUpdate(req.user._id, 
  	{
  		$addToSet: {calls_history: {date:datetime.toISOString(), user:req.body.id}}
  	}, (err, result) => {
    if (err) {
          console.log(err)
          return res.status(200).json({
            success: false
          })  
        }
        res.status(200).json({
            success: true
        })
    })
};

module.exports.getCalls = async function (req, res) {
  User.find({ _id: req.user._id }).select("calls_history -_id")
  .populate({path:"calls_history.user", select:"_id nickname avatar number"})
  .exec(function(err, chat) {   
    res.status(200).json(chat);
  });
};

// module.exports.getTask = async function(req, res) {
//   Task.find({ _id: req.body.id }).exec(function(err, post) {
//     res.status(200).json(post);
//   });
// };

// module.exports.getTime = async function(req, res) {
//   var date = new Date();
//   res.status(200).json(date);
// };

// module.exports.likeTask = async function(req, res) {
//   Task.findByIdAndUpdate(req.body.id, {$addToSet: {likes: req.user._id}}, (err, result) => {
//   if (err) {
//     console.log(err)
//     return res.status(400).json({
//       error: err
//     })
//   } else {
//     return res.status(200).json({
//       status: "OK"
//     })
//    }
//   })
// };

// module.exports.unlikeTask = async function(req, res) {
//   Task.findByIdAndUpdate(req.body.id, {$pull: {likes: req.user._id}}, (err, result) => {
//   if (err) {
//     console.log(err)
//     return res.status(400).json({
//       error: err
//     })
//   } else {
//     return res.status(200).json({
//       status: "OK"
//     })
//    }
//   })
// };


// module.exports.muteTask = async function(req, res) {
//   Task.findByIdAndUpdate(req.body.id, {$addToSet: {mute: req.user._id}}, (err, result) => {
//   if (err) {
//     console.log(err)
//     return res.status(400).json({
//       error: err
//     })
//   } else {
//     return res.status(200).json({
//       status: "OK"
//     })
//    }
//   })
// };

// module.exports.unmuteTask = async function(req, res) {
//   Task.findByIdAndUpdate(req.body.id, {$pull: {mute: req.user._id}}, (err, result) => {
//   if (err) {
//     console.log(err)
//     return res.status(400).json({
//       error: err
//     })
//   } else {
//     return res.status(200).json({
//       status: "OK"
//     })
//    }
//   })
// };

// module.exports.updateTask = async function(req, res) {
//   var datetime = new Date();
//   console.log(datetime);
//   const task = await Task.findOne({ _id:req.body.id });
//   if(req.body.date<datetime){
//     return res.json({ success: false, msg: "Error with task time" });
//   }
//   Task.updateOne(
//     { _id: mongoose.Types.ObjectId(req.body.id) },
//     {
//       $set: {
//         title: req.body.title,
//         text: req.body.text,
//         user_id: req.user._id,
//         time: req.body.date,
//         viber: req.body.viber,
//         whatsapp: req.body.whatsapp,
//         telegram: req.body.telegram
//       }
//     }
//   ).exec(function(err, post) {
//     if (err) {
//       logger.error(err);
//       return res.json({ success: false, msg: "Error." });
//     }
//     res.status(200).json(post);
//     if(task.time!=req.body.date){
//       createSchedule(req, req.body.id); 
//     }
//   });
// };


// module.exports.deleteTask = async function(req, res) {
//  console.log(req.body)
//  let deleteddd = await Task.updateOne(
//     { _id: mongoose.Types.ObjectId(req.body.id) },
//     {
//       $set: {
//         status:"canceled"
//       }
//     }
//   ).exec(function(err, post) {
//     if (err) {
//       logger.error(err);
//       return res.json({ success: false, msg: "Error." });
//     }
//     res.status(200).json(post);
//   });
// };

// module.exports.successTask = function(req, res) {
//   Task.updateOne(
//     { _id: mongoose.Types.ObjectId(req.body.id) },
//     {
//       $set: {
//         status:"success"
//       }
//     }
//   ).exec(function(err, post) {
//     if (err) {
//       logger.error(err);
//       return res.json({ success: false, msg: "Error." });
//     }
//     res.status(200).json(post);
//   });
// };

// // module.exports.upload = function(req, res) {
// //   upload(req, res, function(err) {
// //     if (err instanceof multer.MulterError) {
// //       return res.status(500).json(err);
// //     } else if (err) {
// //       logger.error(err);
// //       return res.status(500).json(err);
// //     }
// //     var maxsize = 2 * 1024 * 1024;
// //     var supportMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
// //     if (req.file.size > maxsize) {
// //          fs.unlinkSync(req.file.path);
// //          return res.json({success: false, msg: 'File is so more than 2 Mb'});
// //        }
// //     if(supportMimeTypes.indexOf(req.file.mimetype) == -1) {
// //         fs.unlinkSync(req.file.path);
// //          return res.json({success: false, msg: 'Unsupported mimetype'});
// //     }
// //     return res.status(200).send(req.file);
// //   });
// // };

// // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZDFlY2NjZWNmMzc1ZTA2Nzg4MGRlOTAiLCJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNTYyOTA0NTU5LCJpYXQiOjE1NjIyOTk3NTl9.T4HRVt41FTp0d2izFjYDli3oIltIwXS2MK7PrkcVROc

// async function createSchedule(req, id) {
//   var date = new Date(parseInt(req.body.year), parseInt(req.body.month), parseInt(req.body.day), parseInt(req.body.hour), parseInt(req.body.minutes), 0, 0);
//   var j = schedule.scheduleJob(date, function(){
//       var date_now = new Date();
//       var user = {
//         _id:'',
//         username:''
//       };
//       Task.find({ _id: id }).exec(function(err, task) {
//         if(task[0].status=='waiting' && task[0].time == date_now){
//           if(task[0].group){
//            Group.findOne({ _id: task[0].group }).populate("admins","_id username")
//           .populate("followers", "_id username").exec(function(err, post) {
//             for (var i = 0; i < post.followers.length; i++) {
//               if(task[0].mute.indexOf(post.followers[i]._id ) == -1){
//               user._id = post.followers[i]._id
//               user.username = post.followers[i].username
//               sendMessage(task, user, id);
//             }
//             }
//           });
//           }else{
//             sendMessage(task, req.user, id);
//           } 

//         }
//       });
//     });
// }

// async function sendMessage(task, user, id) {
//   console.log(task[0])
//   if(task[0].viber){
//     Notice.find({ user_id: user._id }).exec(function(err, post) {
//       if(post[0].viber_activated)
//           viber.sendMessage(task[0].text,post[0].viber_token)
//       })  
//   }
//   if(task[0].whatsapp){     
//     Notice.find({ user_id: user._id }).exec(async function(err, post) {
//       if(post[0].whatsapp_activated)
//         whatsapp.sendMessage(task[0].text,post[0].whatsapp_token)
//     })  
//   }
//   if(task[0].telegram){     
//     Notice.find({ user_id: user._id }).exec(async function(err, post) {
//       if(post[0].telegram_activated)
//         telegram.sendMessage(task[0].text,post[0].telegram_token)
//     })  
//   }
//   user = await User.findOne({ _id: user._id });    
//   socket.sendMessage(task[0].text, user._id);
//   mail.sendMailToUser(task[0].title, task[0].text, user.email).then(result => {
//   var send = result.smtpTransport.sendMail(result.mailOptions, async function(
//     error,
//     info
//   ) {
//   if (error) {
//     console.log(error);
//     return res.json({ success: false, msg: "Message not send." });
//     } else {
//       console.log(info.response);
//       Task.updateOne(
//         { _id: id },
//         {
//           $set: {
//             status:"success"
//           }
//         }
//       ).exec(function(err, post) {
//         if (err) {
//           console.log("ERR")
//         }
//         });
//           console.log("OK")
//       }
//     });
//   });
// }
