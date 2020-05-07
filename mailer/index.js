var nodemailer = require("nodemailer");
var message = require("./message");

module.exports.sendMail = async function(name, number) {
  let smtpTransport;
  let output = await message.createMessage(name, number);
  try {
    smtpTransport = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      auth: {
        user: "salihanski@gmail.com",
        pass: "pmosvxwsteskdwlt"
      }
    });
  } catch (e) {
    return console.log("Error: " + e.name + ":" + e.message);
  }

  let mailOptions = {
    from: 'salger.ru',
    to: "salih@salger.ru",
    subject: "Обращение с сайта",
    text: "Это проверочное сообщение",
    html: output
  };

  return { smtpTransport: smtpTransport, mailOptions: mailOptions };
};

module.exports.sendMailToUser = async function(name, number, email) {
  let smtpTransport;
  let output = await message.createMessage(name, number);
  try {
    smtpTransport = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      auth: {
        user: "salihanski@gmail.com",
        pass: "pmosvxwsteskdwlt"
      }
    });
  } catch (e) {
    return console.log("Error: " + e.name + ":" + e.message);
  }

  let mailOptions = {
    from: 'salger.ru',
    to: email,
    subject: "Обращение с сайта",
    text: "Это проверочное сообщение",
    html: output
  };

  return { smtpTransport: smtpTransport, mailOptions: mailOptions };
};

module.exports.sendToken = async function(url, email) {
  let smtpTransport;
  let output = await message.createToken(url);
  try {
    smtpTransport = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      auth: {
        user: "salihanski@gmail.com",
        pass: "pmosvxwsteskdwlt"
      }
    });
  } catch (e) {
    return console.log("Error: " + e.name + ":" + e.message);
  }
  let mailOptions = {
    from: 'salger.ru',
    to: email,
    subject: "Обращение с сайта",
    text: "Это проверочное сообщение",
    html: output
  };

  return { smtpTransport: smtpTransport, mailOptions: mailOptions };
};

module.exports.sendResetCode = async function(code, email) {
  let smtpTransport;
  let output = await message.createCode(code);
  try {
    smtpTransport = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      auth: {
        user: "salihanski@gmail.com",
        pass: "pmosvxwsteskdwlt"
      }
    });
  } catch (e) {
    return console.log("Error: " + e.name + ":" + e.message);
  }
  let mailOptions = {
    from: 'salger.ru',
    to: email,
    subject: "Обращение с сайта",
    text: "Смена пароля",
    html: output
  };

  return { smtpTransport: smtpTransport, mailOptions: mailOptions };
};

// armada@free-style.kz