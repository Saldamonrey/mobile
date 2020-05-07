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
  <div>Подтвердите почту- :<a href=${name}>Подтвердить</a></div>
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
  <div>Код для смены пароля - ${code}</div>
  </body>
  </html>`
  );
};
