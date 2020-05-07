const express = require('express');
let passport = require('passport');
const mongoose = require("mongoose");
const jwt = require('express-jwt');
const path = require('path');
const app = express();
var multer = require("multer");

const port = 3001;
const db_url = 'mongodb://localhost:27017/from_my_heart';
const config = 'Salih';

const auth = jwt({
  secret: config,
  credentialsRequired: false
});

mongoose.promise = global.Promise;

app.use(express.json());
app.use(express.urlencoded({extended: false}));

mongoose.connect(
	db_url,
	  { 
      useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true  }, (err) => {
	  	console.log(err)
	  }
);
mongoose.set("useFindAndModify", false);
mongoose.connection.once("open", () =>
  console.log(`Connected to mongo at ${db_url}`)
);

require( "./models/user" );
require( "./models/chat" );
require( "./models/message" );
require( "./config-passport" );

app.use(passport.initialize())
let ctrlMessages = require("./controllers/messages");
let ctrlUsers = require("./controllers/users");
let ctrlChats = require("./controllers/chats");
app.use("/static", express.static(path.join(__dirname, "./static")));
// const route = require("./routes");
// app.use("/api", route);
var str = "dfgdfg/fdgdfg/sfdsf"
console.log(str.slice(str.lastIndexOf('/')))
console.log(str.replace('/', '\\' ))
//User routes
app.post("/login", ctrlUsers.login);
app.put("/signup", ctrlUsers.signup);
app.get("/verify/:token", ctrlUsers.verify)
app.get("/profile", auth, ctrlUsers.profile);
app.post("/nickname", auth, ctrlUsers.setNickname);
app.post("/avatar", auth, ctrlUsers.setAvatar);
app.post("/getnickname", auth, ctrlUsers.getIdByNickname);
app.post("/sendereset", ctrlUsers.sendResetCode);
app.post("/checkreset", ctrlUsers.checkReset);
app.post("/reset", ctrlUsers.resetPassword);
app.post("/addimage", auth, ctrlUsers.addImage);
//Chat routes
app.post("/chat", auth, ctrlChats.createChat);
app.post("/checkchat", auth, ctrlChats.checkChat);
app.post("/deletechat", auth, ctrlChats.deleteChat);
app.get("/chat", auth, ctrlChats.getChat);
// app.delete("/chat", auth, ctrlChats.deleteChat);
//Message routes
app.post("/message", auth, ctrlMessages.addMessages);
app.post("/upload", auth, ctrlMessages.uploadFile);
app.post("/addcall", auth, ctrlMessages.addCall);
app.get("/getcalls", auth, ctrlMessages.getCalls);

let server = require('http').Server(app);
let io = require('socket.io')(server);
io.on('connection', async function(socket) {
  console.log("George join")
  socket.on('join', async function (addcode) {
  	io.of('/').in('5eaafbee94c21b246274b2c4').clients(((error, clients)=>{
  	console.log(clients)
	// console.log(app.io.sockets.connected)
  	}))
   	console.log(addcode)
    socket.join(addcode);
  });
  socket.on('exit', async function (addcode) {
  	socket.leave(addcode);
  	socket.disconnect();
  });
  socket.on('setId', async function (id) {
    socket._id = id;
    ctrlUsers.setStatus(1, id)
  });
  socket.on('disconnect', async function() {
      console.log('Got disconnect!');
      // ctrlUsers.setStatus(0, socket._id)
   });
});

server.listen(port, () => {
	console.log(`App listen on ${port} port`)
})


module.exports.io = io;