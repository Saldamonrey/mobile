var fs = require("fs");
const file = fs.readFileSync(__dirname + "/email.css", "utf8");
module.exports.createMessage = function(name, number) {
  return (
    `
  <!DOCTYPE html PUBLIC>
  <head>
  <meta name="viewport" content="width=device-width" />

  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>ZURBemails</title>

  <style>` +
    file +
    `</style>

  </head>

  <body bgcolor="#FFFFFF">
	<div>Название напоминания - :`+name+`</div>
	<div>Напоминание:`+number+`</div>
  </body>
  </html>`
  );
};

module.exports.createToken = function(name) {
  return (
    `
  <!DOCTYPE html PUBLIC>
  <head>
  <meta name="viewport" content="width=device-width" />

  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>ZURBemails</title>

  <style>` +
    file +
    `</style>

  </head>

  <body bgcolor="#FFFFFF">
  <div>Accept email- :<a href=${name}>Accept</a></div>
  </body>
  </html>`
  );
};

module.exports.createCode = function(code) {
  return (
    `
  <!DOCTYPE html PUBLIC>
  <head>
  <meta name="viewport" content="width=device-width" />

  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>ZURBemails</title>

  <style>` +
    file +
    `</style>

  </head>

  <body bgcolor="#FFFFFF">
  <div>Code for reset - ${code}</div>
  </body>
  </html>`
  );
};
