const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "ynov.ydays@gmail.com",
    pass: "ynovDays",
  },
});

module.exports.sendConfirmationEmail = (name, email, confirmCode) => {
    console.log("Check");
    transport.sendMail({
      from: "ynov.ydays@gmail.com",
      to: email,
      subject: "Please confirm your account",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=http://localhost:3000/user/confirm/${confirmCode}> Click here</a>
          </div>`,
    }).catch(err => console.log(err));
  };