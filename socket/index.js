const app = require("../app");

module.exports.sendMessage = async function(message, chat_id) {
  const {text, _id, user, createdAt, image} = message
  // console.log(app.io.sockets)
  app.io.of('/').in('5eaafbee94c21b246274b2c4').clients(((error, clients)=>{
 //  	console.log(clients)
	// console.log(app.io.sockets.connected)
  }))
  app.io.sockets.in(chat_id).emit('message', [{text, _id, user, createdAt, image}]);
}

module.exports.sendInvite = async function(text, id) {
  app.io.sockets.in(chat_id).emit('invite',{id: text});
}


