const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  user: {_id: String, name: String, avatar: String},
  chat_id: {
    type: String,
    required: true
  },
  text: {
    type: String
  },
  createdAt: { 
    type: String, 
    required: true 
   },
   system:Boolean,
   image:{type: String}
});

const Message = mongoose.model("Message", MessageSchema);
