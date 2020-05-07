const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true
  },
  deleted: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  messages: [{type: mongoose.Schema.ObjectId, ref: 'Message'}],
  members: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  last_message: {type: mongoose.Schema.ObjectId, ref: 'Message'}
});

const Chat = mongoose.model("Chat", ChatSchema);
