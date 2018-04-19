var express = require("express");
var router = express.Router();
var nodemailer = require("nodemailer");
var request = require("request");
var midlleware = require("../middlewares");
var sgTransport = require('nodemailer-sendgrid-transport')
// contact form
router.get("/", midlleware.isLoggedIn, function(req, res) {
  res.render("contact/contactMe", { page: 'contact' });
});

router.post('/send', function(req, res) {
  const captcha = req.body["g-recaptcha-response"];
  if (!captcha) {
    console.log(req.body);
    req.flash("error", "Please select captcha");
    return res.redirect("back");
  }
  // secret key
  var secretKey = process.env.SECRET_KEY;
  // Verify URL
  var verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}&remoteip=${req
      .connection.remoteAddress}`;
  // Make request to Verify URL
  request.get(verifyURL, (err, response, body) => {
    if (err) return err;
    // if not successful
    if (body.success !== undefined && !body.success) {
      req.flash("error", "Captcha Failed");
      return res.redirect("/contact");
    }


    let options = {
      auth: {
        api_user: 'devofficial',
        api_key: 'imdev1996'
      }
    }
    let mailOptions = {
      from: req.body.email, // sender address
      to: 'debasisnath84@gmail.com', // list of receivers
      subject: "Become an admin contact request from: " + req.body.name, // Subject line
      text: req.sanitize(req.body.message), // plain text body
      html: '<h3>You have received an email from...</h3><ul><li>Name: ' + req.body.name + ' </li><li>Email: ' + req.body.email + ' </li></ul><p>Message: <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + req.body.message + ' </p>' // html body
      // html body
    };
    var client = nodemailer.createTransport(sgTransport(options));

    client.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
      req.flash("success", "we got your message ..Will get back to you shortly");
      res.redirect('/home');
    });
  });

});


module.exports = router;
