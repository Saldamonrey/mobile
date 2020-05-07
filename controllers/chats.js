var mongoose = require("mongoose");
var Chat = mongoose.model("Chat");
var User = mongoose.model("User");

module.exports.unfollow = async function(req, res){
  Chat.findByIdAndUpdate(req.body.id, {$pull: {followers: req.user._id}}, (err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    } else {
      User.findByIdAndUpdate(req.user._id, {$pull: {groups: req.body.id}}, (err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
          })
        } else {
          console.log(result)
          return res.status(200).json({
            status: "OK"
          })
        }
      })
    }
  })
}

module.exports.follow = async function(req, res){
  console.log(req.body)
  Chat.findByIdAndUpdate(req.body.id, {$addToSet: {followers: req.user._id}}, (err, result) => {
    if (err) {
      console.log(err)
      return res.status(400).json({
        error: err
      })  
    } else {
      User.findByIdAndUpdate(req.user._id, {$addToSet: {groups:req.body.id}}, (err, result) => {
      if (err) {
        console.log(err)
        return res.status(400).json({
          error: err
        })
      } else {
         User.findByIdAndUpdate(req.user._id, {$pull: {invites:req.body.id}}, (err, result) => {
          if (err) {
            console.log(err)
            return res.status(400).json({
              error: err
            })
          } else {
            console.log(result)
            return res.status(200).json({
              status: "OK"
            })
          }
        })
      }
    })
    }
  })
}

module.exports.createChat = async function createChat(req, res){
const chat = await new Chat({
  title:"Переписька",
  type:"Переписька",
  messages:[],
  members:[req.user._id, req.body.id],
  deleted:[]
});
var save = await chat.save(async function(err,chat) {
    if (err) {
      console.log(err);
      return res.json({ success: false, msg: "Error with username" });
    } else {
        User.updateMany({'_id': {$in :[req.user._id, req.body.id]}}, 
          {$addToSet: { chats: chat._id }}, (err, result) => {
        if (err) {
          console.log(err)
          return res.status(400).json({
            error: err
          })
        } else {       
          return res.status(200).json({
            chat
          })
        }
      })
    }
  })
}

module.exports.deleteChat = async function(req, res){
User.findByIdAndUpdate(req.user._id, {$addToSet: {block_list: req.body.chats}}, (err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    } else {
      Chat.updateMany({'_id': {$in :req.body.chats}}, {$addToSet: { deleted: req.user._id }}, 
        (err, result) => {
          if(err) {
            return res.status(200).json({
            success: false,
            result: "Error"
          })
          }
          return res.status(200).json({
            status: "OK"
          })
        })                            
      
    }
  })
}

module.exports.getChat = async function (req, res) {
  Chat.find({ _id: req.body.id })
  .populate("members","_id username avatar")
  .populate({path: "messages", select:"_id user text createdAt", options: { limit: 20 }})
  .exec(function(err, chat) {   
    res.status(200).json(chat);
  });
};

module.exports.checkChat = async function(req, res) {
  Chat.findOne({ members: {"$all":[req.user._id, req.body.id]} })
  .populate({path: "messages", select:"_id user text createdAt image"})
  // .populate({path: "members", select:"_id nickname avatar", options: {$ne: req.user._id}})
  .populate({path: "members", select:"_id nickname avatar"})
  .exec(function(err, chat) {
    if(chat !== null && chat.deleted.includes(req.user._id)){
      console.log("result")
      Chat.findByIdAndUpdate(chat._id, {$pull: {deleted: req.user._id}}, (err, result) => {
        if (err) {
          console.log(err)
          return res.status(200).json({
            success: false
          })  
        }
        User.findByIdAndUpdate(req.user._id, {$pull: {block_list: chat._id}}, (err, result) => {
          if (err) {
          console.log(err)
          return res.status(200).json({
            success: false
          })  
        }
        })
      })
    // console.log(chat)
    }
    res.status(200).json(chat);
  });
};

module.exports.invite = async function(req, res){
console.log(req.body)
const data = await Chat.findOne({ _id:req.body.id });
  if (data.admins.indexOf(req.user._id) == -1){
    return res.json({
        error: "You are not admin"
      })
  }
 const user = await User.findOne({ username:req.body.name });
 for (var i = 0; i < user.invites.length; i++) {
    if(user.invites[i].id==req.body.id ){
      return res.json({
        error: "Invite est uzhe"
      })
    }
 }
User.findByIdAndUpdate(user._id, {$addToSet: {invites: req.body.id}}, (err, result) => {
  if (err) {
    console.log(err)
    return res.status(400).json({
      error: err
    })
  } else {
    console.log(result)
    socket.sendInvite(data.name, user._id);
    return res.status(200).json({
      status: "OK"
    })
   }
  })
}


module.exports.uninvite = async function(req, res){
User.findByIdAndUpdate(req.user._id, {$pull: {invites: req.body.id}}, (err, result) => {
  if (err) {
    console.log(err)
    return res.status(400).json({
      error: err
    })
  } else {
    return res.status(200).json({
      status: "OK"
    })
   }
  })
}


module.exports.kick = async function(req, res){
const data = await Chat.findOne({ _id:req.body.id });
  if (data.admins.indexOf(req.user._id) == -1){
    return res.json({
        error: "You are not admin"
      })
  }
  if (data.admins.indexOf(req.body.id) != -1){
    return res.json({
        error: "Selected user is admin"
      })
  }
  Chat.findByIdAndUpdate(req.body.group_id, {$pull: {followers: req.body.id}}, (err, result) => {
    if (err) {
      console.log(err)
      return res.status(400).json({
        error: err
      })
    } else {
      User.findByIdAndUpdate(req.body.id, {$pull: {groups: req.body.group_id}}, (err, result) => {
      if (err) {
        console.log(err)
        return res.status(400).json({
          error: err
        })
      } else {
        return res.status(200).json({
          status: "OK"
        })
       }
      })
    }
  })
}



